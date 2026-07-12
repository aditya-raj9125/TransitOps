import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DriverStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(
    orgId: string,
    page = 1,
    pageSize = 20,
    q?: string,
    status?: DriverStatus,
    regionId?: string,
  ) {
    const where: Prisma.DriverWhereInput = {
      orgId,
      deletedAt: null,
      ...(status && { status }),
      ...(regionId && { regionId }),
      ...(q && {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { licenseNumber: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { region: true },
      }),
      this.prisma.driver.count({ where }),
    ]);
    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string, orgId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        region: true,
        trips: {
          orderBy: { scheduledStart: 'desc' },
          take: 10,
          include: { vehicle: { select: { registrationNumber: true } } },
        },
        documents: { orderBy: { uploadedAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' }, take: 20 },
      },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return driver;
  }

  async create(dto: CreateDriverDto, orgId: string, userId: string) {
    const existing = await this.prisma.driver.findFirst({
      where: { licenseNumber: dto.licenseNumber, orgId },
    });
    if (existing) {
      throw new ConflictException('Driver with this license number already exists');
    }

    const driver = await this.prisma.driver.create({
      data: {
        ...dto,
        licenseExpiryDate: new Date(dto.licenseExpiryDate),
        orgId,
        dateJoined: new Date(),
      },
    });

    await this.audit.log({
      orgId,
      userId,
      action: 'CREATE',
      entityType: 'Driver',
      entityId: driver.id,
      description: `Registered driver ${driver.fullName}`,
      newValue: driver,
    });

    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, orgId: string, userId: string) {
    const driver = await this.findOne(id, orgId);
    const updated = await this.prisma.driver.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.licenseExpiryDate && { licenseExpiryDate: new Date(dto.licenseExpiryDate) }),
      },
    });

    await this.audit.log({
      orgId,
      userId,
      action: 'UPDATE',
      entityType: 'Driver',
      entityId: driver.id,
      description: `Updated driver ${driver.fullName}`,
      oldValue: driver,
      newValue: updated,
    });

    return updated;
  }

  async softDelete(id: string, orgId: string, userId: string) {
    const driver = await this.findOne(id, orgId);
    
    // Check for active trips
    const activeTrips = await this.prisma.trip.count({
      where: {
        driverId: id,
        status: { in: ['Draft', 'Dispatched'] },
      },
    });

    if (activeTrips > 0) {
      throw new BadRequestException('Cannot delete driver with active trips');
    }

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      orgId,
      userId,
      action: 'DELETE',
      entityType: 'Driver',
      entityId: id,
      description: `Deleted driver ${driver.fullName}`,
    });

    return true;
  }
}
