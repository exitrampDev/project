// dto/create-invite.dto.ts

import { IsEmail, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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


  @IsString()
  @IsNotEmpty()
  role!: string;

@IsObject()
@IsNotEmpty()
accuisitionType!: Record<string, any>;
}