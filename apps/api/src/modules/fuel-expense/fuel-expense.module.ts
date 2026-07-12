import { Module } from '@nestjs/common';
import { FuelExpenseController } from './fuel-expense.controller';
import { FuelExpenseService } from './fuel-expense.service';
import { PrismaModule } from '../../database/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [FuelExpenseController],
  providers: [FuelExpenseService],
})
export class FuelExpenseModule {}
