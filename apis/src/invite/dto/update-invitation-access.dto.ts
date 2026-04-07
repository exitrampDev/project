// dto/update-invite-status.dto.ts

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum InviteAccess {
  GRANTED = 'granted',
  REVOKED = 'revoked',
}

export class UpdateInviteAccessDto {

  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsEnum(InviteAccess)
  access!: InviteAccess;
}


