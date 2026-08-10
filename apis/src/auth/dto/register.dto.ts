// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { UserType } from 'src/users/enums/user-type.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 128, { message: 'Password must be between 6 and 128 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @IsEnum(UserType, {
    message: 'User type must be one of: admin, subscriber, buyer_basic, buyer_premium, seller_broker, seller_individual',
  })
  user_type: UserType;

  @IsOptional()
  @IsString()
  captchaId?: string;

  @IsOptional()
  @IsString()
  captcha_id?: string;

  @IsOptional()
  @IsString()
  captchaValue?: string;

  @IsOptional()
  @IsString()
  captcha_value?: string;
}
