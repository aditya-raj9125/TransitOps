import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'List documents' })
  async findAll(@Query() query: QueryDocumentsDto, @CurrentUser('orgId') orgId: string) {
    return this.documentsService.findAll(orgId, query);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'Get document details' })
  async findOne(@Param('id') id: string, @CurrentUser('orgId') orgId: string) {
    const data = await this.documentsService.findOne(id, orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'Upload a document' })
  async create(@Body() dto: CreateDocumentDto, @CurrentUser() user: any) {
    const data = await this.documentsService.create(dto, user.orgId, user.id);
    return { data, message: 'Document uploaded successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager, UserRole.SafetyOfficer)
  @ApiOperation({ summary: 'Update document' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.documentsService.update(id, dto, user.orgId, user.id);
    return { data, message: 'Document updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.FleetManager)
  @ApiOperation({ summary: 'Delete document' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.documentsService.remove(id, user.orgId, user.id);
    return { data: { success: true }, message: 'Document removed successfully' };
  }
}
