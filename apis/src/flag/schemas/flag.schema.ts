import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlagDocument = Flag & Document;

@Schema({ timestamps: true })
export class Flag {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  description: string; 

  @Prop({ type: String, required: true })
  businessId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FlagSchema = SchemaFactory.createForClass(Flag);

// 🔹 Add unique index to prevent duplicates
FlagSchema.index({ userId: 1, businessId: 1 }, { unique: true });
