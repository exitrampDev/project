import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  businessId: string;

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
