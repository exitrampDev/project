import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserType } from '../enums/user-type.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ default: '' })
  phone_number: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  email_verified: boolean;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserType, default: UserType.SUBSCRIBER })
  user_type: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
