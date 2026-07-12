import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { DocumentEntityType, DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsEnum(DocumentEntityType)
  entityType: DocumentEntityType;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  driverId?: string;

  @IsEnum(DocumentType)
  docType: DocumentType;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class UpdateDocumentDto {
  @IsEnum(DocumentType)
  @IsOptional()
  docType?: DocumentType;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class QueryDocumentsDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsEnum(DocumentEntityType)
  @IsOptional()
  entityType?: DocumentEntityType;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  driverId?: string;
}
