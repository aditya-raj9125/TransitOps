import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateMaintenanceDto, UpdateMaintenanceDto, QueryMaintenanceDto } from './dto/maintenance.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.Dispatcher, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'List maintenance logs' })
  async findAll(@Query() query: QueryMaintenanceDto, @CurrentUser('orgId') orgId: string) {
    return this.maintenanceService.findAll(orgId, query);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Get maintenance log details' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.maintenanceService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Create a new maintenance log' })
  async create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: any) {
    const data = await this.maintenanceService.create(dto, user.orgId, user.id);
    return { data, message: 'Maintenance record created successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Update maintenance log' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.maintenanceService.update(id, dto, user.orgId, user.id);
    return { data, message: 'Maintenance record updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Delete maintenance log' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.maintenanceService.remove(id, user.orgId, user.id);
    return { data: { success: true }, message: 'Maintenance record removed successfully' };
  }
}
