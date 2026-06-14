import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {


  @Prop({ type: [String], default: [] })
  senterId!: string[]; //user ids

  @Prop({ type: String })
  message!: string;

  @Prop({ type: String })
  file!: string; // base64 image

}

export const MessageSchema = SchemaFactory.createForClass(Message);
