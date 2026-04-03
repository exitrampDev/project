// dto/create-invite.dto.ts

import { IsEmail, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInviteDto {
  @IsMongoId()
  @IsOptional()
  invitedUserId!: string;

  @IsMongoId()
  @IsOptional()
  invitedByUserId!: string;

  
  @IsEmail()
  @IsNotEmpty()
  invitedEmail!: string;

  @IsMongoId()
  @IsNotEmpty()
  businessId!: string;
}