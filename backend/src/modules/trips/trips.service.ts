import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  TripStatus, VehicleStatus, DriverStatus, Prisma,
} from '@prisma/client';
import { CreateTripDto, UpdateTripDto, QueryTripsDto, CompleteTripDto } from './dto/trip.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FleetEventGateway } from '../../websockets/fleet-events.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly gateway: FleetEventGateway,
    private readonly config: ConfigService,
  ) {}

  // ───────────────────────────────────────────────────────────────
  // LIST
  // ───────────────────────────────────────────────────────────────

  async findAll(query: QueryTripsDto, orgId: string) {
    const {
      page = 1, pageSize = 20, q, status, vehicleId, driverId,
      from, to, sortBy = 'scheduledStart', sortOrder = 'desc',
    } = query;

    const where: Prisma.TripWhereInput = {
      orgId,
      ...(status && { status }),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
      ...(from || to
        ? { scheduledStart: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } }
        : {}),
      ...(q && {
        OR: [
          { tripCode: { contains: q, mode: 'insensitive' } },
          { source: { contains: q, mode: 'insensitive' } },
          { destination: { contains: q, mode: 'insensitive' } },
          { vehicle: { registrationNumber: { contains: q, mode: 'insensitive' } } },
          { driver: { fullName: { contains: q, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicle: { select: { id: true, registrationNumber: true, nameModel: true, type: true } },
          driver: { select: { id: true, fullName: true, safetyScore: true } },
          createdBy: { select: { fullName: true } },
          region: true,
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string, orgId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, orgId },
      include: {
        vehicle: true,
        driver: true,
        createdBy: { select: { fullName: true, email: true } },
        route: true,
        region: true,
        fuelLogs: true,
        expenses: true,
      },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);

    const auditHistory = await this.prisma.auditLog.findMany({
      where: { entityType: 'Trip', entityId: id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { fullName: true, email: true } } },
    });

    return { ...trip, auditHistory };
  }

  // ───────────────────────────────────────────────────────────────
  // CREATE (Draft)
  // ───────────────────────────────────────────────────────────────

  async create(dto: CreateTripDto, orgId: string, userId: string) {
    await this.validateVehicleForDispatch(dto.vehicleId, orgId, dto.cargoWeightKg);
    await this.validateDriverForDispatch(dto.driverId, orgId);

    const tripCode = await this.generateTripCode(orgId);

    const trip = await this.prisma.trip.create({
      data: {
        orgId,
        tripCode,
        source: dto.source,
        destination: dto.destination,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        cargoWeightKg: dto.cargoWeightKg,
        plannedDistanceKm: dto.plannedDistanceKm,
        scheduledStart: new Date(dto.scheduledStart),
        revenueAmount: dto.revenueAmount,
        routeId: dto.routeId,
        regionId: dto.regionId,
        status: TripStatus.Draft,
        createdById: userId,
      },
      include: { vehicle: true, driver: true },
    });

    await this.audit.log({
      orgId, userId, action: 'CREATE', entityType: 'Trip', entityId: trip.id,
      description: `Trip ${tripCode} created (Draft) — ${dto.source} → ${dto.destination}`,
      newValue: trip,
    });

    return trip;
  }

  // ───────────────────────────────────────────────────────────────
  // DISPATCH (Draft → Dispatched) — Single DB transaction
  // ───────────────────────────────────────────────────────────────

  async dispatch(id: string, orgId: string, userId: string, overrideRestTime = false) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, orgId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    if (trip.status !== TripStatus.Draft) {
      throw new BadRequestException(`Trip is ${trip.status} — only Draft trips can be dispatched`);
    }

    // Full validation pipeline
    await this.runDispatchValidation(trip, overrideRestTime);

    // Advisory lock via serializable transaction to prevent race conditions
    const result = await this.prisma.$transaction(
      async (tx) => {
        // Double-check availability inside transaction (prevent TOCTOU)
        const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
        if (vehicle.status !== VehicleStatus.Available) {
          throw new ConflictException(`Vehicle ${vehicle.registrationNumber} is no longer available`);
        }

        const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
        if (driver.status !== DriverStatus.Available) {
          throw new ConflictException(`Driver ${driver.fullName} is no longer available`);
        }

        const [updatedTrip] = await Promise.all([
          tx.trip.update({
            where: { id },
            data: { status: TripStatus.Dispatched, actualStart: new Date() },
          }),
          tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: VehicleStatus.OnTrip },
          }),
          tx.driver.update({
            where: { id: trip.driverId },
            data: { status: DriverStatus.OnTrip },
          }),
          tx.vehicleStatusHistory.create({
            data: {
              vehicleId: trip.vehicleId, oldStatus: VehicleStatus.Available,
              newStatus: VehicleStatus.OnTrip, changedById: userId,
              reason: `Dispatched for trip ${trip.tripCode}`,
            },
          }),
          tx.driverStatusHistory.create({
            data: {
              driverId: trip.driverId, oldStatus: DriverStatus.Available,
              newStatus: DriverStatus.OnTrip, changedById: userId,
              reason: `Dispatched for trip ${trip.tripCode}`,
            },
          }),
        ]);

        return updatedTrip;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await this.audit.log({
      orgId, userId, action: 'DISPATCH', entityType: 'Trip', entityId: id,
      description: `Trip ${trip.tripCode} dispatched — Vehicle ${trip.vehicle.registrationNumber}, Driver ${trip.driver.fullName}`,
    });

    // Broadcast to WebSocket clients
    this.gateway.broadcastTripUpdate(orgId, { type: 'TRIP_DISPATCHED', tripId: id, tripCode: trip.tripCode });
    this.gateway.broadcastKpiUpdate(orgId);

    return result;
  }

  // ───────────────────────────────────────────────────────────────
  // COMPLETE (Dispatched → Completed) — Single DB transaction
  // ───────────────────────────────────────────────────────────────

  async complete(id: string, dto: CompleteTripDto, orgId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, orgId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    if (trip.status !== TripStatus.Dispatched) {
      throw new BadRequestException(`Trip is ${trip.status} — only Dispatched trips can be completed`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const [updatedTrip] = await Promise.all([
        tx.trip.update({
          where: { id },
          data: {
            status: TripStatus.Completed,
            actualEnd: new Date(),
            actualDistanceKm: dto.actualDistanceKm,
            fuelConsumedLiters: dto.fuelConsumedLiters,
            revenueAmount: dto.revenueAmount,
          },
        }),
        tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: {
            status: VehicleStatus.Available,
            odometerKm: dto.finalOdometerKm || undefined,
          },
        }),
        tx.driver.update({
          where: { id: trip.driverId },
          data: {
            status: DriverStatus.Available,
            lastTripCompletedAt: new Date(),
            totalTripsCompleted: { increment: 1 },
          },
        }),
        tx.vehicleStatusHistory.create({
          data: {
            vehicleId: trip.vehicleId, oldStatus: VehicleStatus.OnTrip,
            newStatus: VehicleStatus.Available, changedById: userId,
            reason: `Trip ${trip.tripCode} completed`,
          },
        }),
        tx.driverStatusHistory.create({
          data: {
            driverId: trip.driverId, oldStatus: DriverStatus.OnTrip,
            newStatus: DriverStatus.Available, changedById: userId,
            reason: `Trip ${trip.tripCode} completed`,
          },
        }),
      ]);

      // Auto-create fuel log if fuel consumed provided
      if (dto.fuelConsumedLiters && dto.fuelCost) {
        await tx.fuelLog.create({
          data: {
            orgId,
            vehicleId: trip.vehicleId,
            tripId: id,
            liters: dto.fuelConsumedLiters,
            cost: dto.fuelCost,
            odometerReading: dto.finalOdometerKm,
            logDate: new Date(),
            createdById: userId,
          },
        });
      }

      return updatedTrip;
    });

    await this.audit.log({
      orgId, userId, action: 'COMPLETE', entityType: 'Trip', entityId: id,
      description: `Trip ${trip.tripCode} completed — ${dto.actualDistanceKm}km, ${dto.fuelConsumedLiters}L fuel`,
    });

    this.gateway.broadcastTripUpdate(orgId, { type: 'TRIP_COMPLETED', tripId: id });
    this.gateway.broadcastKpiUpdate(orgId);

    return result;
  }

  // ───────────────────────────────────────────────────────────────
  // CANCEL (Dispatched/Draft → Cancelled) — Single DB transaction
  // ───────────────────────────────────────────────────────────────

  async cancel(id: string, orgId: string, userId: string, reason: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, orgId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    if (![TripStatus.Draft, TripStatus.Dispatched].includes(trip.status)) {
      throw new BadRequestException(`Trip is ${trip.status} — cannot be cancelled`);
    }

    const wasDispatched = trip.status === TripStatus.Dispatched;

    await this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: { status: TripStatus.Cancelled, cancellationReason: reason },
      });

      if (wasDispatched) {
        await Promise.all([
          tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.Available } }),
          tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.Available } }),
          tx.vehicleStatusHistory.create({
            data: {
              vehicleId: trip.vehicleId, oldStatus: VehicleStatus.OnTrip,
              newStatus: VehicleStatus.Available, changedById: userId,
              reason: `Trip ${trip.tripCode} cancelled`,
            },
          }),
          tx.driverStatusHistory.create({
            data: {
              driverId: trip.driverId, oldStatus: DriverStatus.OnTrip,
              newStatus: DriverStatus.Available, changedById: userId,
              reason: `Trip ${trip.tripCode} cancelled`,
            },
          }),
        ]);
      }
    });

    await this.audit.log({
      orgId, userId, action: 'CANCEL', entityType: 'Trip', entityId: id,
      description: `Trip ${trip.tripCode} cancelled — Reason: ${reason}`,
    });

    this.gateway.broadcastTripUpdate(orgId, { type: 'TRIP_CANCELLED', tripId: id });
    this.gateway.broadcastKpiUpdate(orgId);
  }

  // ───────────────────────────────────────────────────────────────
  // SMART VEHICLE SUGGESTION ENGINE (§5.1)
  // ───────────────────────────────────────────────────────────────

  async suggestVehicles(orgId: string, cargoWeightKg: number, regionId?: string) {
    const candidates = await this.prisma.vehicle.findMany({
      where: {
        orgId,
        deletedAt: null,
        status: VehicleStatus.Available,
        maxLoadCapacityKg: { gte: cargoWeightKg },
      },
      include: {
        region: true,
        fuelLogs: { orderBy: { logDate: 'desc' }, take: 20 },
        maintenanceLogs: {
          where: { createdAt: { gte: new Date(Date.now() - 90 * 24 * 3600000) } },
          orderBy: { createdAt: 'desc' },
        },
        trips: {
          where: { status: TripStatus.Completed },
          orderBy: { actualEnd: 'desc' },
          take: 10,
          select: { plannedDistanceKm: true, actualDistanceKm: true, fuelConsumedLiters: true },
        },
      },
    });

    const scored = candidates.map((v) => {
      // 1. Capacity fit score (0–30): reward 60–90% utilization
      const util = cargoWeightKg / Number(v.maxLoadCapacityKg);
      const capacityScore = util >= 0.6 && util <= 0.9 ? 30 : util < 0.6 ? Math.max(0, 30 - (0.6 - util) * 100) : 10;

      // 2. Regional proximity score (0–25)
      const proximityScore = v.regionId === regionId ? 25 : 0;

      // 3. Fuel efficiency score (0–25): higher km/L → higher score
      const totalKm = v.fuelLogs.reduce((s, f) => s + Number(f.liters), 0);
      const totalLiters = v.fuelLogs.reduce((s, f) => s + Number(f.liters), 0);
      const avgEfficiency = totalLiters > 0 ? totalKm / totalLiters : 10;
      const efficiencyScore = Math.min(25, avgEfficiency * 2);

      // 4. Maintenance risk score (0–20): fewer recent logs = higher score
      const maintenanceRisk = Math.max(0, 20 - v.maintenanceLogs.length * 4);

      const totalScore = capacityScore + proximityScore + efficiencyScore + maintenanceRisk;

      return { ...v, score: totalScore, util, avgEfficiency, recentMaintenance: v.maintenanceLogs.length };
    });

    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    return sorted.map((v, i) => ({
      ...v,
      badge: i === 0 ? 'Best Fit' : i === 1 ? 'Most Efficient' : 'Nearest',
      utilizationPercent: Math.round(v.util * 100),
    }));
  }

  // ───────────────────────────────────────────────────────────────
  // DRIVER REST-TIME RECOMMENDATION ENGINE (§5.2)
  // ───────────────────────────────────────────────────────────────

  async suggestDrivers(orgId: string, scheduledStart: string) {
    const restThresholdHours = Number(this.config.get('DRIVER_REST_THRESHOLD_HOURS') || 2);
    const scheduled = new Date(scheduledStart);

    const candidates = await this.prisma.driver.findMany({
      where: {
        orgId,
        deletedAt: null,
        status: DriverStatus.Available,
        licenseExpiryDate: { gt: scheduled },
      },
      include: { region: true },
    });

    return candidates.map((d) => {
      const hoursSinceLast = d.lastTripCompletedAt
        ? (Date.now() - d.lastTripCompletedAt.getTime()) / 3600000
        : 999;

      const needsRestWarning = hoursSinceLast < restThresholdHours;
      const restWarningMessage = needsRestWarning
        ? `⚠️ ${d.fullName} completed a trip ${Math.round(hoursSinceLast * 60)} min ago — consider an alternate driver for safety`
        : null;

      // Score: safety score (0–100) + rest bonus (0–20)
      const restBonus = Math.min(20, hoursSinceLast * 2);
      const score = d.safetyScore + restBonus;

      return {
        ...d,
        score,
        hoursSinceLast: Math.round(hoursSinceLast * 10) / 10,
        needsRestWarning,
        restWarningMessage,
        licenseExpiryStatus:
          d.licenseExpiryDate < new Date(Date.now() + 30 * 24 * 3600000) ? 'expiring_soon' : 'valid',
      };
    }).sort((a, b) => b.score - a.score);
  }

  // ───────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────

  private async validateVehicleForDispatch(vehicleId: string, orgId: string, cargoKg: number) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, orgId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.status !== VehicleStatus.Available) {
      throw new BadRequestException(`Vehicle is ${vehicle.status} — must be Available to dispatch`);
    }
    if (Number(vehicle.maxLoadCapacityKg) < cargoKg) {
      throw new BadRequestException(
        `Cargo weight ${cargoKg}kg exceeds vehicle max capacity ${vehicle.maxLoadCapacityKg}kg`,
      );
    }
    const activeTrip = await this.prisma.trip.findFirst({
      where: { vehicleId, status: TripStatus.Dispatched },
    });
    if (activeTrip) {
      throw new ConflictException(`Vehicle already has an active trip (${activeTrip.tripCode})`);
    }
  }

  private async validateDriverForDispatch(driverId: string, orgId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, orgId, deletedAt: null },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.status === DriverStatus.Suspended) {
      throw new BadRequestException('Suspended drivers cannot be assigned to trips');
    }
    if (driver.status !== DriverStatus.Available) {
      throw new BadRequestException(`Driver is ${driver.status} — must be Available to dispatch`);
    }
    if (driver.licenseExpiryDate < new Date()) {
      throw new BadRequestException(
        `Driver's license expired on ${driver.licenseExpiryDate.toDateString()}`,
      );
    }
    const activeTrip = await this.prisma.trip.findFirst({
      where: { driverId, status: TripStatus.Dispatched },
    });
    if (activeTrip) {
      throw new ConflictException(`Driver already has an active trip (${activeTrip.tripCode})`);
    }
  }

  private async runDispatchValidation(trip: any, overrideRestTime: boolean) {
    await this.validateVehicleForDispatch(trip.vehicleId, trip.orgId, Number(trip.cargoWeightKg));
    await this.validateDriverForDispatch(trip.driverId, trip.orgId);

    if (!overrideRestTime) {
      const restThresholdHours = Number(this.config.get('DRIVER_REST_THRESHOLD_HOURS') || 2);
      const driver = await this.prisma.driver.findUnique({ where: { id: trip.driverId } });
      if (driver.lastTripCompletedAt) {
        const hoursSinceLast = (Date.now() - driver.lastTripCompletedAt.getTime()) / 3600000;
        if (hoursSinceLast < restThresholdHours) {
          throw new BadRequestException({
            message: `Driver rest time warning — ${Math.round(hoursSinceLast * 60)} minutes since last trip`,
            requiresOverride: true,
            driver: { id: driver.id, name: driver.fullName, hoursSinceLast },
          });
        }
      }
    }
  }

  private async generateTripCode(orgId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.trip.count({ where: { orgId } });
    return `TRIP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
