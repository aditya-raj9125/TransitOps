import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateFuelExpenseDto {
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsUUID()
  @IsOptional()
  tripId?: string;

  @IsNumber()
  @Min(0)
  liters: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @IsOptional()
  odometerReading?: number;

  @IsString()
  @IsOptional()
  fuelStation?: string;

  @IsDateString()
  logDate: string;
}

export class UpdateFuelExpenseDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  liters?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsNumber()
  @IsOptional()
  odometerReading?: number;

  @IsString()
  @IsOptional()
  fuelStation?: string;

  @IsDateString()
  @IsOptional()
  logDate?: string;
}

export class QueryFuelExpenseDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  tripId?: string;
}
