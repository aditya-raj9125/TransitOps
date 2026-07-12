import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { LicenseCategory, DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsEnum(LicenseCategory)
  licenseCategory: LicenseCategory;

  @IsDateString()
  licenseExpiryDate: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsEnum(LicenseCategory)
  @IsOptional()
  licenseCategory?: LicenseCategory;

  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;
  
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  safetyScore?: number;
}

export class QueryDriversDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}
