import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;


  @IsEmail()
  email: string;

  @IsOptional()
  email_verified?: boolean;

  @MinLength(6)
  password: string;

  @IsEnum(UserType, { message: 'Invalid user type' })
  @IsOptional()
  user_type?: UserType;

}
