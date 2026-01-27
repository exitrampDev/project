// src/business-listing/dto/query-business.dto.ts
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBusinessDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 100;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  askingPrice?: string;

  // ----------------------
  @IsOptional()
  @IsString()
  askingPriceMin?: string;

  @IsOptional()
  @IsString()
  askingPriceMax?: string;

    @IsOptional()
  @IsString()
  cashFlowMin?: string;

  @IsOptional()
  @IsString()
  cashFlowMax?: string;
  // -----------------------

  @IsOptional()
  @IsString()
  cashFlow?: string;

}
