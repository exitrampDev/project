import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type TicketMessageDocument = TicketMessage & Document;

export enum SenderType {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({
    type: Types.ObjectId,
    ref: 'Ticket',
    required: true,
  })
  ticketId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderId!: Types.ObjectId;

  @Prop({
    enum: SenderType,
    required: true,
  })
  senderType!: SenderType;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const TicketMessageSchema =
  SchemaFactory.createForClass(TicketMessage);