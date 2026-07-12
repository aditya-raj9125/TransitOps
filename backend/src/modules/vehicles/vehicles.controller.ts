import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, VehicleStatus } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.Dispatcher, UserRole.FinancialAnalyst)
  @ApiOperation({ summary: 'List vehicles with pagination and filtering' })
  async findAll(@Query() query: QueryVehiclesDto, @CurrentUser('orgId') orgId: string) {
    return this.vehiclesService.findAll(query, orgId);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.Dispatcher, UserRole.FinancialAnalyst)
  @ApiOperation({ summary: 'Get vehicle details, timelines, and computed financials' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.vehiclesService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Register a new vehicle' })
  async create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
    const data = await this.vehiclesService.create(dto, user.orgId, user.id);
    return { data, message: 'Vehicle registered successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Update vehicle details' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser() user: any) {
    const data = await this.vehiclesService.update(id, dto, user.orgId, user.id);
    return { data, message: 'Vehicle updated successfully' };
  }

  @Patch(':id/status')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Update vehicle status (triggers history tracking)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: VehicleStatus,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.vehiclesService.updateStatus(id, status, user.orgId, user.id, reason);
    return { data, message: 'Vehicle status updated' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Soft-delete a vehicle (prevents active trip deletion)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.vehiclesService.softDelete(id, user.orgId, user.id);
    return { data: { success: true }, message: 'Vehicle removed successfully' };
  }
}
