import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DueDiligenceStatus } from '../schemas/due-diligence.schema';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  createdAt?: Date;
}

export class CreateDueDiligenceDto {
  @IsString()
  @IsNotEmpty()
  ndaId: string; // Reference to NDA submission

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsEnum(DueDiligenceStatus, {
    message: `status must be one of: ${Object.values(DueDiligenceStatus).join(', ')}`,
  })
  status?: DueDiligenceStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  comments?: CommentDto[];
}
