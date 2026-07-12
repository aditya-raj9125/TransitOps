import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Soft-delete helper — sets deletedAt and filters it automatically
   * via Prisma middleware (registered in the module).
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    await this.$transaction([
      this.auditLog.deleteMany(),
      this.notification.deleteMany(),
      this.document.deleteMany(),
      this.expense.deleteMany(),
      this.fuelLog.deleteMany(),
      this.maintenanceLog.deleteMany(),
      this.trip.deleteMany(),
      this.route.deleteMany(),
      this.driverStatusHistory.deleteMany(),
      this.vehicleStatusHistory.deleteMany(),
      this.driver.deleteMany(),
      this.vehicle.deleteMany(),
      this.refreshToken.deleteMany(),
      this.user.deleteMany(),
      this.rolePermission.deleteMany(),
      this.role.deleteMany(),
      this.region.deleteMany(),
      this.organization.deleteMany(),
    ]);
  }
}
