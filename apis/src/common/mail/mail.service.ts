import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {

  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(to: string, token: string) {
    const appUrl = process.env.APP_URL;
    const confirmUrl = `${appUrl}/verify-email?token=${token}`;

    return this.mailerService.sendMail({
      to,
      subject: 'Confirm your email address',
      template: './confirmation', // looks for templates/confirmation.hbs
      context: {
        confirmUrl,
      },
    });
  }

  async sendResetPassword(to: string, name: string, token: string) {
    const resetUrl = `https://yourdomain.com/reset-password?token=${token}`;

    return this.mailerService.sendMail({
      to,
      subject: 'Reset your password',
      template: './reset-password',
      context: {
        name,
        resetUrl,
      },
    });
  }

  async sendGeneric(to: string, subject: string, template: string, context: Record<string, any>) {
    return this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context,
    });
  }
}
