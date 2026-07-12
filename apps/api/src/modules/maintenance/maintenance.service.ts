import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto, QueryMaintenanceDto } from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(orgId: string, query: QueryMaintenanceDto) {
    const { page = 1, pageSize = 20, vehicleId, status } = query;
    const where: Prisma.MaintenanceLogWhereInput = {
      orgId,
      ...(vehicleId && { vehicleId }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.maintenanceLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: { select: { registrationNumber: true, nameModel: true } } },
      }),
      this.prisma.maintenanceLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string, orgId: string) {
    const log = await this.prisma.maintenanceLog.findFirst({
      where: { id, orgId },
      include: { vehicle: true },
    });
    if (!log) throw new NotFoundException(`Maintenance log ${id} not found`);
    return log;
  }

  async create(dto: CreateMaintenanceDto, orgId: string, userId: string) {
    const log = await this.prisma.maintenanceLog.create({
      data: {
        ...dto,
        orgId,
        createdById: userId,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : null,
      },
    });

    await this.audit.log({ orgId, userId, action: 'CREATE', entityType: 'MaintenanceLog', entityId: log.id, description: `Created maintenance log`, newValue: log });
    return log;
  }

  async update(id: string, dto: UpdateMaintenanceDto, orgId: string, userId: string) {
    const log = await this.findOne(id, orgId);
    
    const updated = await this.prisma.maintenanceLog.update({
      where: { id },
      data: {
        ...dto,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
      },
    });

    await this.audit.log({ orgId, userId, action: 'UPDATE', entityType: 'MaintenanceLog', entityId: id, description: `Updated maintenance log`, oldValue: log, newValue: updated });
    return updated;
  }

  async remove(id: string, orgId: string, userId: string) {
    const log = await this.findOne(id, orgId);
    await this.prisma.maintenanceLog.delete({ where: { id } });
    await this.audit.log({ orgId, userId, action: 'DELETE', entityType: 'MaintenanceLog', entityId: id, description: `Deleted maintenance log` });
    return { success: true };
  }
}
