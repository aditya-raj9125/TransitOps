import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FuelExpenseService } from './fuel-expense.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateFuelExpenseDto, UpdateFuelExpenseDto, QueryFuelExpenseDto } from './dto/fuel-expense.dto';

@ApiTags('Fuel Expenses')
@Controller('fuel-expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class FuelExpenseController {
  constructor(private readonly fuelService: FuelExpenseService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.FinancialAnalyst)
  @ApiOperation({ summary: 'List fuel expenses' })
  async findAll(@Query() query: QueryFuelExpenseDto, @CurrentUser('orgId') orgId: string) {
    return this.fuelService.findAll(orgId, query);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.FinancialAnalyst)
  @ApiOperation({ summary: 'Get fuel expense details' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.fuelService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Create a fuel log' })
  async create(@Body() dto: CreateFuelExpenseDto, @CurrentUser() user: any) {
    const data = await this.fuelService.create(dto, user.orgId, user.id);
    return { data, message: 'Fuel expense created successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Update fuel log' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFuelExpenseDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.fuelService.update(id, dto, user.orgId, user.id);
    return { data, message: 'Fuel expense updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Delete fuel log' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.fuelService.remove(id, user.orgId, user.id);
    return { data: { success: true }, message: 'Fuel expense removed successfully' };
  }
}
