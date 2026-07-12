import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VehicleStatus, Prisma } from '@prisma/client';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto } from './dto/vehicle.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryVehiclesDto, orgId: string) {
    const {
      page = 1, pageSize = 20, q, status, type, regionId, sortBy = 'createdAt', sortOrder = 'desc',
    } = query;

    const where: Prisma.VehicleWhereInput = {
      orgId,
      deletedAt: null,
      ...(status && { status: status as VehicleStatus }),
      ...(type && { type }),
      ...(regionId && { regionId }),
      ...(q && {
        OR: [
          { registrationNumber: { contains: q, mode: 'insensitive' } },
          { nameModel: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          region: true,
          _count: { select: { trips: true, maintenanceLogs: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string, orgId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        region: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 20,
          include: { changedBy: { select: { fullName: true, email: true } } },
        },
        trips: {
          orderBy: { scheduledStart: 'desc' },
          take: 10,
          include: { driver: { select: { fullName: true } } },
        },
        maintenanceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        fuelLogs: {
          orderBy: { logDate: 'desc' },
          take: 10,
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        _count: { select: { trips: true } },
      },
    });

    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);

    // Compute financials
    const [fuelCostAgg, maintenanceCostAgg, expensesAgg, revenueAgg] =
      await this.prisma.$transaction([
        this.prisma.fuelLog.aggregate({ where: { vehicleId: id }, _sum: { cost: true } }),
        this.prisma.maintenanceLog.aggregate({ where: { vehicleId: id }, _sum: { cost: true } }),
        this.prisma.expense.aggregate({ where: { vehicleId: id }, _sum: { amount: true } }),
        this.prisma.trip.aggregate({ where: { vehicleId: id }, _sum: { revenueAmount: true } }),
      ]);

    const totalCost =
      Number(fuelCostAgg._sum.cost || 0) +
      Number(maintenanceCostAgg._sum.cost || 0) +
      Number(expensesAgg._sum.amount || 0);
    const totalRevenue = Number(revenueAgg._sum.revenueAmount || 0);
    const acquisitionCost = Number(vehicle.acquisitionCost);
    const roi =
      acquisitionCost > 0
        ? ((totalRevenue - totalCost) / acquisitionCost) * 100
        : 0;

    return {
      ...vehicle,
      financials: {
        totalFuelCost: Number(fuelCostAgg._sum.cost || 0),
        totalMaintenanceCost: Number(maintenanceCostAgg._sum.cost || 0),
        totalExpenses: Number(expensesAgg._sum.amount || 0),
        totalOperationalCost: totalCost,
        totalRevenue,
        roi: Math.round(roi * 100) / 100,
      },
    };
  }

  async create(dto: CreateVehicleDto, orgId: string, userId: string) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { orgId, registrationNumber: dto.registrationNumber, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle with registration number '${dto.registrationNumber}' already exists`,
      );
    }

    const vehicle = await this.prisma.$transaction(async (tx) => {
      const v = await tx.vehicle.create({
        data: { ...dto, orgId, status: VehicleStatus.Available },
        include: { region: true },
      });
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: v.id,
          newStatus: VehicleStatus.Available,
          changedById: userId,
          reason: 'Vehicle registered',
        },
      });
      return v;
    });

    await this.audit.log({
      orgId, userId, action: 'CREATE', entityType: 'Vehicle', entityId: vehicle.id,
      description: `Vehicle ${vehicle.registrationNumber} registered`,
      newValue: vehicle,
    });

    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, orgId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);

    if (dto.registrationNumber && dto.registrationNumber !== vehicle.registrationNumber) {
      const conflict = await this.prisma.vehicle.findFirst({
        where: { orgId, registrationNumber: dto.registrationNumber, deletedAt: null, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Registration number already in use');
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
      include: { region: true },
    });

    await this.audit.log({
      orgId, userId, action: 'UPDATE', entityType: 'Vehicle', entityId: id,
      description: `Vehicle ${vehicle.registrationNumber} updated`,
      oldValue: vehicle, newValue: updated,
    });

    return updated;
  }

  async updateStatus(
    id: string,
    newStatus: VehicleStatus,
    orgId: string,
    userId: string,
    reason?: string,
  ) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);

    if (vehicle.status === VehicleStatus.Retired && newStatus !== VehicleStatus.Retired) {
      throw new BadRequestException('Retired vehicles cannot be reactivated');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const v = await tx.vehicle.update({
        where: { id },
        data: { status: newStatus },
      });
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: id,
          oldStatus: vehicle.status,
          newStatus,
          changedById: userId,
          reason,
        },
      });
      return v;
    });

    await this.audit.log({
      orgId, userId, action: 'UPDATE', entityType: 'Vehicle', entityId: id,
      description: `Vehicle ${vehicle.registrationNumber} status: ${vehicle.status} → ${newStatus}`,
      oldValue: { status: vehicle.status }, newValue: { status: newStatus },
    });

    return updated;
  }

  async softDelete(id: string, orgId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);

    const activeTrip = await this.prisma.trip.findFirst({
      where: { vehicleId: id, status: { in: ['Dispatched'] } },
    });
    if (activeTrip) {
      throw new BadRequestException('Cannot delete a vehicle with an active trip');
    }

    await this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      orgId, userId, action: 'DELETE', entityType: 'Vehicle', entityId: id,
      description: `Vehicle ${vehicle.registrationNumber} soft-deleted`,
    });
  }

  async getAvailableForDispatch(orgId: string, cargoWeightKg: number) {
    return this.prisma.vehicle.findMany({
      where: {
        orgId,
        deletedAt: null,
        status: VehicleStatus.Available,
        maxLoadCapacityKg: { gte: cargoWeightKg },
      },
      include: {
        region: true,
        fuelLogs: { orderBy: { logDate: 'desc' }, take: 10 },
        maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }
}
