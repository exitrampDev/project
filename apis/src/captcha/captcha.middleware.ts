import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CaptchaService } from './captcha.service';

@Injectable()
export class CaptchaValidationMiddleware implements NestMiddleware {
  constructor(private readonly captchaService: CaptchaService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body = req.body || {};
    const captchaId = body.captchaId || body.captcha_id;
    const captchaValue = body.captchaValue || body.captcha_value;

    // if (!captchaId || !captchaValue) {
    //   throw new BadRequestException('Captcha id and value are required');
    // }

    // await this.captchaService.validateCaptcha(captchaId, captchaValue);
    next();
  }
}
