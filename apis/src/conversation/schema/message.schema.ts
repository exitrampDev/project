import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {


   @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    required: true,
  })
  senderId!: string;

  @Prop({ type: String })
  message!: string;

  @Prop({ type: String })
  file!: string; // base64 image

  @Prop({
  type: Types.ObjectId,
  ref: 'Conversation',
  required: true,
  })
  conversationId!: Types.ObjectId;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
