import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentPurpose {
  BUSINESS_CREATION = 'BUSINESS_CREATION',
  BUSINESS_RENEWAL = 'BUSINESS_RENEWAL',
}

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  /** Business ID or other entity */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  referenceId: Types.ObjectId;

  /** BUSINESS_CREATION | BUSINESS_RENEWAL */
  @Prop({ type: String, enum: PaymentPurpose, required: true })
  paymentFor: PaymentPurpose;

  /** Amount in dollars */
  @Prop({ type: Number, required: true })
  amount: number;

  /** Stripe PaymentIntent ID */
  @Prop({ type: String, index: true })
  paymentIntentId?: string;

  /** Stripe Charge ID */
  @Prop({ type: String })
  chargeId?: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: Date })
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
