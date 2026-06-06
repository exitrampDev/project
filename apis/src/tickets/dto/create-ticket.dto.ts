import { IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  ticketTitle?: string;

  @IsOptional()
  @IsString()
  ticketDescription?: string;
}