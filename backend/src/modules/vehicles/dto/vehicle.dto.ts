import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, IsUUID } from 'class-validator';
import { VehicleType, FuelType } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  nameModel: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @Min(0)
  maxLoadCapacityKg: number;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;

  @IsNumber()
  @Min(0)
  acquisitionCost: number;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  nameModel?: string;

  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxLoadCapacityKg?: number;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  acquisitionCost?: number;

  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}

export class QueryVehiclesDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
