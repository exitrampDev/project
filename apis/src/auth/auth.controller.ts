// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { console } from 'inspector';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/common/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { NewsLetterSubscription } from './dto/newsletter-subscription.dto';
import { ContactUsDto } from './dto/contact-us.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // console.log('Login attempt with:', loginDto);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Get('server-datetime')
  async getServerDateTime() {
    const now = new Date();
    return { serverDateTime: now };
  }

   @Post('login-by-admin')
  async loginByAdmin(@Body() loginDto:{ userId: string }) {
    console.log('Login attempt with:', loginDto.userId);
    const user = await this.authService.loginById(loginDto.userId);
    console.log('User found for admin login:', user);
    return this.authService.login(user);
    return true;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    let user = await this.authService.register(registerDto);

      await this.mailService.sendMail(
      user.data.email,
      'Welcome to Exit Ramp',
      'welcomeEmail',
      {
        message: ``,
      });
    
    return user
  }

 @Post('send-password-reset-email')
  async sendConfirmation(@Body() body: { email: string}) {
    // const hash = await bcrypt.hash(body.email + Date.now(), 10);
    const hash = this.jwtService.sign(
            { email: body.email }, // payload
            { secret: process.env.JWT_SECRET, expiresIn: '15m' }
          );
    const confirmationToken = `${encodeURIComponent(hash)}`;
    await this.mailService.sendUserConfirmation(body.email, confirmationToken);
    return { message: 'Confirmation email sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@User() user: any) {
     const dbUser = await this.authService.findById(user.userId);
     return dbUser;
  }

  @Post('newsletter-subscription')
  async newsLetterSubscription(@Body() registerDto: NewsLetterSubscription) {
    return this.mailService.newsletterSubscription(registerDto);
  }

    @Post('contact-us-form')
  async contactUsForm(@Body() registerDto: ContactUsDto) {
     
        await this.mailService.sendMail(
          process.env.EMAIL_FOR_ADMIN || '',
          'Contact Us Form Submission',
          'generalMessage',
          {
            receiverName:  'Exit Ramp Admin',
            message:"contact us form submission : " + registerDto.message + ",<br> subject: " + registerDto.subject + ",<br> form email : " + registerDto.email+",<br> from name : " + registerDto.first_name + " " + registerDto.last_name,
          }
        );
        return true;
  }
  
}
