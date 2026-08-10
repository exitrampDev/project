import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { CaptchaValidationMiddleware } from './captcha.middleware';
import { Captcha, CaptchaSchema } from './schemas/captcha.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Captcha.name, schema: CaptchaSchema }])],
  controllers: [CaptchaController],
  providers: [CaptchaService, CaptchaValidationMiddleware],
  exports: [CaptchaService, CaptchaValidationMiddleware],
})
export class CaptchaModule {}
