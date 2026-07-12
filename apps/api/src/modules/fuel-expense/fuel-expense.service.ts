import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CreateFuelExpenseDto, UpdateFuelExpenseDto, QueryFuelExpenseDto } from './dto/fuel-expense.dto';

@Injectable()
export class FuelExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(orgId: string, query: QueryFuelExpenseDto) {
    const { page = 1, pageSize = 20, vehicleId, tripId } = query;
    const where: Prisma.FuelLogWhereInput = {
      orgId,
      ...(vehicleId && { vehicleId }),
      ...(tripId && { tripId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.fuelLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { logDate: 'desc' },
        include: { vehicle: { select: { registrationNumber: true, nameModel: true } } },
      }),
      this.prisma.fuelLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string, orgId: string) {
    const log = await this.prisma.fuelLog.findFirst({
      where: { id, orgId },
      include: { vehicle: true, trip: true },
    });
    if (!log) throw new NotFoundException(`Fuel log ${id} not found`);
    return log;
  }

  async create(dto: CreateFuelExpenseDto, orgId: string, userId: string) {
    const log = await this.prisma.fuelLog.create({
      data: {
        ...dto,
        orgId,
        createdById: userId,
        logDate: new Date(dto.logDate),
      },
    });

    await this.audit.log({ orgId, userId, action: 'CREATE', entityType: 'FuelLog', entityId: log.id, description: `Created fuel log`, newValue: log });
    return log;
  }

  async update(id: string, dto: UpdateFuelExpenseDto, orgId: string, userId: string) {
    const log = await this.findOne(id, orgId);
    const updated = await this.prisma.fuelLog.update({
      where: { id },
      data: {
        ...dto,
        logDate: dto.logDate ? new Date(dto.logDate) : undefined,
      },
    });

    await this.audit.log({ orgId, userId, action: 'UPDATE', entityType: 'FuelLog', entityId: id, description: `Updated fuel log`, oldValue: log, newValue: updated });
    return updated;
  }

  async remove(id: string, orgId: string, userId: string) {
    const log = await this.findOne(id, orgId);
    await this.prisma.fuelLog.delete({ where: { id } });
    await this.audit.log({ orgId, userId, action: 'DELETE', entityType: 'FuelLog', entityId: id, description: `Deleted fuel log` });
    return { success: true };
  }
}
