import { Controller, Get } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get()
  async createCaptcha() {
    return this.captchaService.createCaptcha();
  }
}
