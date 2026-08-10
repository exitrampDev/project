import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import * as svgCaptcha from 'svg-captcha';
import { Captcha, CaptchaDocument } from './schemas/captcha.schema';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(
    @InjectModel(Captcha.name)
    private readonly captchaModel: Model<CaptchaDocument>,
  ) {}

  async createCaptcha() {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      width: 150,
      height: 50,
      ignoreChars: '0Oo1Il',
      color: true,
    });

    const record = new this.captchaModel({
      text: captcha.text,
      svg: captcha.data,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    });

    await record.save();

    return {
      captchaId: record._id.toString(),
      captcha_id: record._id.toString(),
      svg: captcha.data,
    };
  }

  async validateCaptcha(captchaId: string, captchaValue: string) {
    if (!captchaId || !captchaValue) {
      throw new BadRequestException('Captcha id and value are required');
    }

    if (!isValidObjectId(captchaId)) {
      throw new BadRequestException('Invalid captcha id');
    }

    const captcha = await this.captchaModel.findById(captchaId);
    if (!captcha) {
      throw new BadRequestException('Captcha not found or expired');
    }

    if (captcha.used) {
      throw new BadRequestException('Captcha already used');
    }

    if (captcha.expiresAt < new Date()) {
      throw new BadRequestException('Captcha expired');
    }

    if (captcha.text.toLowerCase() !== captchaValue.toString().trim().toLowerCase()) {
      throw new BadRequestException('Invalid captcha');
    }

    captcha.used = true;
    await captcha.save();

    return true;
  }
}
