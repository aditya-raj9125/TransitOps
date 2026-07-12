import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DriverStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async findAll(orgId: string, page = 1, pageSize = 20, q?: string, status?: DriverStatus, regionId?: string) {
    const where: Prisma.DriverWhereInput = {
      orgId, deletedAt: null,
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
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' }, include: { region: true },
      }),
      this.prisma.driver.count({ where }),
    ]);
    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string, orgId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        region: true,
        trips: { orderBy: { scheduledStart: 'desc' }, take: 10, include: { vehicle: { select: { registrationNumber: true } } } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' }, take: 20 },
      },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return driver;
  }
}
