import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(orgId: string, query: QueryDocumentsDto) {
    const { page = 1, pageSize = 20, entityType, vehicleId, driverId } = query;
    const where: Prisma.DocumentWhereInput = {
      orgId,
      ...(entityType && { entityType }),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string, orgId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, orgId },
      include: { vehicle: true, driver: true },
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async create(dto: CreateDocumentDto, orgId: string, userId: string) {
    const doc = await this.prisma.document.create({
      data: {
        ...dto,
        orgId,
        uploadedById: userId,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });

    await this.audit.log({ orgId, userId, action: 'CREATE', entityType: 'Document', entityId: doc.id, description: `Uploaded document ${doc.fileName}`, newValue: doc });
    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, orgId: string, userId: string) {
    const doc = await this.findOne(id, orgId);
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });

    await this.audit.log({ orgId, userId, action: 'UPDATE', entityType: 'Document', entityId: id, description: `Updated document ${doc.fileName}`, oldValue: doc, newValue: updated });
    return updated;
  }

  async remove(id: string, orgId: string, userId: string) {
    const doc = await this.findOne(id, orgId);
    await this.prisma.document.delete({ where: { id } });
    await this.audit.log({ orgId, userId, action: 'DELETE', entityType: 'Document', entityId: id, description: `Deleted document ${doc.fileName}` });
    return { success: true };
  }
}
