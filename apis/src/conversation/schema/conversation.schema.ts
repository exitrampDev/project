import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {


  @Prop({ type: [String], default: [] })
  participants!: string[]; //user ids


}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
