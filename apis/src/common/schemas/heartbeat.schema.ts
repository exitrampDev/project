import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeartBeatDocument = HeartBeat & Document;

@Schema({ timestamps: true })
export class HeartBeat extends Document {
  @Prop({ required: true })
  data: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  readerId: string;

  @Prop({
    expires: 60 * 60 * 24 * 7, // 7 days in seconds
    default: () => new Date(),
  })
  createdAt: Date; // override the default createdAt to support TTL
}

export const HeartBeatSchema = SchemaFactory.createForClass(HeartBeat);
