import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, CompleteTripDto, QueryTripsDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Trips')
@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @Roles(
    UserRole.Admin,
    UserRole.FleetManager,
    UserRole.Dispatcher,
    UserRole.SafetyOfficer,
    UserRole.FinancialAnalyst,
  )
  @ApiOperation({ summary: 'List trips with pagination and filtering' })
  async findAll(
    @Query() query: QueryTripsDto,
    @CurrentUser('orgId') orgId: string,
  ) {
    return this.tripsService.findAll(query, orgId);
  }

  @Get(':id')
  @Roles(
    UserRole.Admin,
    UserRole.FleetManager,
    UserRole.Dispatcher,
    UserRole.SafetyOfficer,
    UserRole.FinancialAnalyst,
  )
  @ApiOperation({ summary: 'Get single trip detail' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.tripsService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({ summary: 'Create a new trip (Draft)' })
  async create(@Body() dto: CreateTripDto, @CurrentUser() user: any) {
    const data = await this.tripsService.create(dto, user.orgId, user.id);
    return { data, message: 'Trip created successfully' };
  }

  @Post(':id/dispatch')
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({
    summary: 'Dispatch a draft trip (triggers validations and status changes)',
  })
  async dispatch(
    @Param('id') id: string,
    @Body('overrideRestTime') overrideRestTime: boolean,
    @CurrentUser() user: any,
  ) {
    const data = await this.tripsService.dispatch(
      id,
      user.orgId,
      user.id,
      overrideRestTime,
    );
    return { data, message: 'Trip dispatched successfully' };
  }

  @Post(':id/complete')
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({ summary: 'Complete a dispatched trip' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteTripDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.tripsService.complete(id, dto, user.orgId, user.id);
    return { data, message: 'Trip completed successfully' };
  }

  @Post(':id/cancel')
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({ summary: 'Cancel a draft or dispatched trip' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    await this.tripsService.cancel(id, user.orgId, user.id, reason);
    return { data: { success: true }, message: 'Trip cancelled successfully' };
  }

  @Get('suggestions/vehicles')
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({ summary: 'Get smart vehicle suggestions for a new trip' })
  async suggestVehicles(
    @Query('cargoWeightKg') cargoWeightKg: string,
    @Query('regionId') regionId: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    const data = await this.tripsService.suggestVehicles(
      orgId,
      Number(cargoWeightKg),
      regionId,
    );
    return { data };
  }

  @Get('suggestions/drivers')
  @Roles(UserRole.Admin, UserRole.Dispatcher)
  @ApiOperation({
    summary: 'Get driver recommendations and rest-time warnings',
  })
  async suggestDrivers(
    @Query('scheduledStart') scheduledStart: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    const data = await this.tripsService.suggestDrivers(orgId, scheduledStart);
    return { data };
  }
}
