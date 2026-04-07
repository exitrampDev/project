// favorite.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { InviteStatus } from '../dto/update-invite-status.dto';
import { InviteAccess, UpdateInviteAccessDto } from '../dto/update-invitation-access.dto';

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

@Prop({ type: String, default: ''})
 name!: string;


@Prop({ type: String, default: ''})
 role!: string;

@Prop({ type: String, default: ''})
 invitationHash!: string;


@Prop({ type: Object, default: ''})
 accuisitionType!: Record<string, any>;

 @Prop({
  type: String,
  enum: InviteAccess,
  default: InviteAccess.GRANTED
    })
 access!: string;

@Prop({
  type: String,
  enum: InviteStatus,
  default: InviteStatus.PENDING
    })
 status!: string;


}

export const InviteSchema = SchemaFactory.createForClass(Invite);
