import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { TripStatus } from '@prisma/client';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @IsNumber()
  @Min(1)
  cargoWeightKg: number;

  @IsNumber()
  @Min(1)
  plannedDistanceKm: number;

  @IsDateString()
  scheduledStart: string;

  @IsNumber()
  @IsOptional()
  revenueAmount?: number;

  @IsUUID()
  @IsOptional()
  routeId?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}

export class UpdateTripDto {
  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  driverId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  cargoWeightKg?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  plannedDistanceKm?: number;

  @IsDateString()
  @IsOptional()
  scheduledStart?: string;
}

export class CompleteTripDto {
  @IsNumber()
  @Min(1)
  actualDistanceKm: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fuelConsumedLiters?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fuelCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  finalOdometerKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  revenueAmount?: number;
}

export class QueryTripsDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  status?: TripStatus;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  driverId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
