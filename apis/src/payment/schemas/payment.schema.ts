import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  transactionId: string;

  @Prop({ type: Date, default: Date.now })
  dateTime: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: '' })
  message: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
