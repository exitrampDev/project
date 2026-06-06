import { IsEnum } from 'class-validator';
import { TicketStatus } from '../schema/tickets.schema';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}