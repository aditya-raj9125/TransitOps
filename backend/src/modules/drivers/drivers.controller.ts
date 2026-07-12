import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(@Query() query: any, @CurrentUser('orgId') orgId: string) {
    return this.driversService.findAll(orgId, query.page, query.pageSize, query.q, query.status, query.regionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.driversService.findOne(id, orgId);
    return { data };
  }
}
