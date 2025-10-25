import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DueDiligenceDocument = DueDiligence & Document;

export enum DueDiligenceStatus {
  NotStarted = 'no_started',
  Inprogress = 'in_progress',
  Completed = 'completed',
}

@Schema({ timestamps: true })
export class DueDiligence {
  @Prop({ type: Types.ObjectId, ref: 'ndaSubmissions', required: true })
  ndaId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  shortDescription: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({
    type: [
      {
        author: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  comments?: { author: string; message: string; createdAt?: Date }[];

  @Prop({
    enum: Object.values(DueDiligenceStatus),
    default: DueDiligenceStatus.NotStarted,
  })
  status: DueDiligenceStatus;
}

export const DueDiligenceSchema = SchemaFactory.createForClass(DueDiligence);
