import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogParams {
  orgId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      await this.prisma.auditLog.create({
        data: {
          orgId: params.orgId,
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          description: params.description,
          oldValue: params.oldValue
            ? (params.oldValue as Prisma.InputJsonValue)
            : undefined,
          newValue: params.newValue
            ? (params.newValue as Prisma.InputJsonValue)
            : undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // We generally don't want audit log failures to crash the main transaction
    }
  }

  async query(
    orgId: string,
    page = 1,
    pageSize = 20,
    entityType?: string,
    userId?: string,
  ) {
    const where: Prisma.AuditLogWhereInput = {
      orgId,
      ...(entityType && { entityType }),
      ...(userId && { userId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }
}
