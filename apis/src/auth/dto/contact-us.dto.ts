import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ContactUsDto {

 
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  first_name: string;


  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @Length(10, 500, { message: 'Message must be between 10 and 500 characters' })
  message: string;


}
