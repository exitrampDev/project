import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document & { createdAt: Date; updatedAt: Date };
export enum TicketStatus {
  OPENED = 'opened',
  CLOSED = 'closed',
}

// ----------------- Main Ticket Schema -----------------
@Schema({ timestamps: true })
export class Ticket {

  @Prop({ type: String, default: null })
  ticketTitle?: string;

  @Prop({ type: String, default: null })
  ticketDescription?: string;


  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

   @Prop({
    enum: TicketStatus,
    default: TicketStatus.OPENED,
  })
  status!: TicketStatus;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);


