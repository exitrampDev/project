import { Module } from '@nestjs/common';
import { TicketController } from './tickets.controller';
import { TicketService } from './tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schema/tickets.schema';

@Module({
   imports: [
    MongooseModule.forFeature([
      {
        name: Ticket.name,
        schema: TicketSchema,
      },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketsModule {}
