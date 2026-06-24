import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {


 @Prop({
  type: [{ type: Types.ObjectId, ref: 'User' }],
  required: true,
})
  participants!: Types.ObjectId[]; //users ids


}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
