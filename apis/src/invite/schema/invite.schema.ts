// favorite.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ timestamps: true })
export class Invite {

@Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  invitedUserId!: Types.ObjectId;

@Prop({ type: String, required: true })
  invitedEmail!: string;

@Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedByUserId!: Types.ObjectId;

@Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  businessId!: Types.ObjectId;

@Prop({
  type: String,
  enum: ['pending', 'accepted', 'rejected'],
  default: 'pending'
    })
 status!: string;


}

export const InviteSchema = SchemaFactory.createForClass(Invite);
