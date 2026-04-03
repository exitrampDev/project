// dto/update-invite-status.dto.ts

import { IsEnum } from 'class-validator';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class UpdateInviteStatusDto {
  @IsEnum(InviteStatus)
  status!: InviteStatus;
}