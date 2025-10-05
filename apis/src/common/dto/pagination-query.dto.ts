import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;


  @IsOptional()
  @IsString()
  order?: string = 'ASC'; // Default order is ascending

  @IsOptional()
  @IsString()
  orderby?: string = 'createdAt'; // Default order by field is createdAt
}
