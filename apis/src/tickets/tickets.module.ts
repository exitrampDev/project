import { Module } from '@nestjs/common';
import { TicketController } from './tickets.controller';
import { TicketService } from './tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './schema/tickets.schema';
import { TicketMessage, TicketMessageSchema } from './schema/tocket-message.schema';

@Module({
   imports: [
    MongooseModule.forFeature([
      { name: Ticket.name,  schema: TicketSchema },
      { name: TicketMessage.name, schema: TicketMessageSchema },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketsModule {}
