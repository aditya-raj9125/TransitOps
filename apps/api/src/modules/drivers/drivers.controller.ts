import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QueryDriversDto, CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.Dispatcher, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'List drivers' })
  async findAll(@Query() query: QueryDriversDto, @CurrentUser('orgId') orgId: string) {
    return this.driversService.findAll(
      orgId,
      query.page,
      query.pageSize,
      query.q,
      query.status,
      query.regionId,
    );
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.Dispatcher, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'Get driver details' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.driversService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Register a new driver' })
  async create(@Body() dto: CreateDriverDto, @CurrentUser() user: any) {
    const data = await this.driversService.create(dto, user.orgId, user.id);
    return { data, message: 'Driver registered successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Update driver details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.driversService.update(id, dto, user.orgId, user.id);
    return { data, message: 'Driver updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Soft-delete a driver' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.driversService.softDelete(id, user.orgId, user.id);
    return { data: { success: true }, message: 'Driver removed successfully' };
  }
}
