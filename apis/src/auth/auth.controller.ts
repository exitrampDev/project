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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('Login attempt with:', loginDto);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
  
}
