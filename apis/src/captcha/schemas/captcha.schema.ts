import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CaptchaDocument = HydratedDocument<Captcha>;

@Schema({ timestamps: true, collection: 'captchas' })
export class Captcha {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  svg: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const CaptchaSchema = SchemaFactory.createForClass(Captcha);
CaptchaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
