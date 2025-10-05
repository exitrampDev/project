// src/buyer/dto/create-buyer.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

// Business status allowed values
export enum BusinessStatus {
  LIVE = 'live',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export class CreateSellerDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: string; 

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  yearsInOperation?: string;

  @IsOptional()
  @IsEnum(BusinessStatus, { message: 'Status must be live, inactive, or draft' })
  status?: BusinessStatus;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpg|jpeg|gif);base64,/, { message: 'Invalid image format' })
  companyLogo?: string;  // optional image field

  @IsOptional()
  @IsString()
  teamSummaryDocument?: string;

  @IsOptional()
  @IsString()
  companyOverview?: string;
}
