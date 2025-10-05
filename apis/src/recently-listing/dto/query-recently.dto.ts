import { IsOptional, IsString, IsIn, IsInt, Min, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { BusinessStatus } from '../../business-listing/dto/create-business.dto';

export class QueryRecentlyDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  /** 🔍 General search (applies to title, location etc.) */
  @IsOptional()
  @IsString()
  search?: string;

  /** Filters */
  @IsOptional()
  @IsString()
  businessName?: string;  // Title search

  @IsOptional()
  @IsString()
  businessType?: string;  // Type filter

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;  // Status filter

  @IsOptional()
  @IsString()
  state?: string; // Location (state)

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  askingPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @IsString()
  savedOn?: string; // YYYY-MM-DD
}
