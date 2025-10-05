// favorite.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecentlyDocument = Recently & Document;

@Schema({ timestamps: true })
export class Recently {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  businessId: string;
}

export const RecentlySchema = SchemaFactory.createForClass(Recently);

RecentlySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
