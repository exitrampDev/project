// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials1');
    }
    console.log('Validating user with email:', email, password, user.password);

     console.log('🔐 Incoming password:', password);
     console.log('🗄️ Stored hash:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials2');
    }

    // return user data excluding password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      data: user,
    };
  }

   async register(registerDto: RegisterDto) {
  const {
    email,
    password,
    first_name,
    last_name,
    user_type
  } = registerDto;

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await this.usersService.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ConflictException('Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
  // Create user
  const newUser = await this.usersService.create({
    email: normalizedEmail,
    password: hashedPassword,
    first_name,
    last_name,
    user_type,
  
  });

  const userWithoutPassword = newUser;

  // JWT payload: use `user_type` instead of `role` if that's your convention
  const payload = {
    sub: newUser._id,
    email: newUser.email,
    role: newUser.user_type, // was `newUser.role` but likely should be `user_type`
  };

  const access_token = this.jwtService.sign(payload);

  return {
    message: 'User registered successfully',
    access_token,
    data: userWithoutPassword,
  };
}

async resetPassword({ token, newPassword }: ResetPasswordDto) {
  let payload: any;

  try {
    // payload = this.jwtService.verify(token);
   payload = this.jwtService.verify(token, {
                                    secret: process.env.JWT_SECRET,
                                  });
  } catch (e) {
    throw new BadRequestException('Invalid or expired token');
  }

  const user = await this.usersService.findByEmail(payload.email);
  if (!user || user.email !== payload.email) {
    throw new BadRequestException('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await this.usersService.updatePassword(user._id as string, hashedPassword);

  return { message: 'Password reset successfully' };
}

async findById(userId: string) {
  return this.usersService.findOne(userId);
}

}
