// dto/create-invite.dto.ts

import { IsEmail, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class rejectInviteDto {
  @IsString()
  @IsNotEmpty()
  invitationHash!: string;

}