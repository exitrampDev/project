import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'businesses', required: true })
  businessId: string;

  @Prop()
  displayName: string;

  @Prop({default: 'general', type: String})
  typeName: string;

  @Prop()
  filename: string;

  @Prop()
  mimetype: string;

  @Prop()
  size: number;

  @Prop()
  url: string;
}

export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
