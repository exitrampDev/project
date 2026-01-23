import { IsString, IsOptional, IsArray, IsNumber, Matches, IsObject, IsBoolean, IsEnum, IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { UniqueInCollection } from 'src/common/decorators/unique-in-collection.validator';
import { BusinessExists } from 'src/common/decorators/business-exists.validator';




export class ContactFormSellerDto {

   @IsString()
   @BusinessExists({ message: 'Invalid businessId: Business does not exist' })
   businessId: string;

  @IsString()
  @IsEmail()
  senderEmail: string; 

  @IsString()
  subject: string;  

  @IsString()
  details: string;
  

}
