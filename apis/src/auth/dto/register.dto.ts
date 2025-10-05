// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
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
    message: 'User type must be one of: admin, subscriber, buyer, seller, m&a_expert',
  })
  user_type: UserType;
}
