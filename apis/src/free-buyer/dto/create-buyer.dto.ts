// src/buyer/dto/create-buyer.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBuyerDto { 
  
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  investmentBudget?: string;

  @IsOptional()
  @IsString()
  industryOfInterest?: string;

  @IsOptional()
  @IsString()
  regionOfInterest?: string;

  @IsOptional()
  @IsString()
  businessTypePreferrd?: string;

  @IsOptional()
  @IsString()
  howSoonLookinToAcquire?: string;

  @IsOptional()
  @IsString()
  liquidAssetToSupporPurchase?: string;

  @IsOptional()
  @IsString()
  financingIsPlaced?: string;

  @IsOptional()
  @IsString()
  previousAcquisitionExperience?: string;

  @IsOptional()
  @IsString()
  howDoYouPlanToFundYourPurchase?: string;

  @IsOptional()
  @IsString()
  verificationOfFinancialQualification?: string;

  @IsOptional()
  @IsString()
  briefBackground?: string;

  @IsOptional()
  @IsString()
  willingToSignNDAsDigitally?: string;
}
