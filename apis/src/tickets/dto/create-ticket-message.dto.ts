import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateTicketMessageDto {
 @IsString()
  @Matches(/.{10,}/, { message: 'Listing message must be at least 10 characters long' })
  message?: string;

 
}

