// dto/create-invite.dto.ts

import { IsEmail, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  invitationHash!: string;

}