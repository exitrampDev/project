import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { NewsLetterSubscription } from 'src/auth/dto/newsletter-subscription.dto';

@Injectable()
export class MailService {

  constructor(private readonly mailerService: MailerService) {}

   async newsletterSubscription(subscriber: NewsLetterSubscription) {


    await this.mailerService.sendMail({
      to: subscriber.email,
      from: process.env.EMAIL_FROM ,
      subject: 'Newsletters Confirmtion',
      template: './newslettersubsscrition-confirmation', // looks for templates/newslettersubsscrition.hbs
      context: {
       email: subscriber.email,
      },
    });

     return this.mailerService.sendMail({
      to: process.env.EMAIL_FOR_ADMIN,
      from: process.env.EMAIL_FROM ,
      subject: 'email submit for newsletters',
      template: './someone-subscript-for-newsletters', // looks for templates/newslettersubsscrition.hbs
      context: {
       email: subscriber.email,
      },
    });
  }

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
