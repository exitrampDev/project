import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class NewsLetterSubscription {

 
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;


}
