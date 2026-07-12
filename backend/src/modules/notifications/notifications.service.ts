import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';
import { FleetEventGateway } from '../../websockets/fleet-events.gateway';

export interface CreateNotificationParams {
  orgId: string;
  type: NotificationType;
  message: string;
  targetUserId?: string;
  targetRole?: UserRole;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: FleetEventGateway,
  ) {}

  async create(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        orgId: params.orgId,
        type: params.type,
        message: params.message,
        targetUserId: params.targetUserId,
        targetRole: params.targetRole,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    });

    // Broadcast to users if targeted by user or role
    if (params.targetUserId) {
      this.gateway.notifyUser(params.targetUserId, notification);
    }
    if (params.targetRole) {
      this.gateway.notifyRole(params.orgId, params.targetRole, notification);
    }
    
    return notification;
  }

  async findAll(orgId: string, userId: string, role: UserRole, page = 1, pageSize = 20) {
    const where = {
      orgId,
      OR: [
        { targetUserId: userId },
        { targetRole: role },
        { targetUserId: null, targetRole: null }, // Global org notifications
      ],
    };

    const [data, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, isRead: false } }),
    ]);

    return {
      data,
      meta: { total, unreadCount, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async markAsRead(id: string, orgId: string, userId: string, role: UserRole) {
    // Ideally we should verify the user has access to this notification based on the OR query above
    const notification = await this.prisma.notification.findFirst({
      where: {
        id, orgId,
        OR: [
          { targetUserId: userId },
          { targetRole: role },
          { targetUserId: null, targetRole: null },
        ]
      },
    });

    if (!notification) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(orgId: string, userId: string, role: UserRole) {
    const where = {
      orgId,
      isRead: false,
      OR: [
        { targetUserId: userId },
        { targetRole: role },
        { targetUserId: null, targetRole: null },
      ],
    };

    await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });
  }
}
