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

  @Prop({ type: String, required: false })
  sessionId: string;

  @Prop({ type: String, required: false })
  processToExecute: string;

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: String, default: 'pending' })
  objectId: string;

  //business_posting, business
  @Prop({ type: String, default: 'pending' })
  paymentFor: string;

  @Prop({ type: Number, required: true })
  amount: number;
 
  @Prop({ type: String, required: false })
  transactionId: string;

  @Prop({ type: Date, default: Date.now })
  transactionDateTime: Date;

  @Prop({ type: String, default: 'pending' })
  paymentStatus: string;

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
