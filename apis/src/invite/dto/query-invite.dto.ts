// dto/query-invite.dto.ts

import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { InviteStatus } from './update-invite-status.dto';

export class QueryInviteDto {
  @IsOptional()
  @IsMongoId()
  invitedUserId?: string;

  @IsOptional()
  @IsMongoId()
  invitedByUserId?: string;

  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @IsOptional()
  @IsEnum(InviteStatus)
  status?: InviteStatus;
}