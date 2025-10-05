import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {

 
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 128, { message: 'Password must be between 6 and 128 characters' })
  password: string;
}
