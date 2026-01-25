import { IsString, IsOptional, IsArray, IsNumber, Matches, IsObject, IsBoolean, IsEnum, IsNotEmpty, IsEmail, IsIn, IsInt, isNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { UniqueInCollection } from 'src/common/decorators/unique-in-collection.validator';
import { BusinessExists } from 'src/common/decorators/business-exists.validator';




export class ContactFormSellerDto {

  @IsString()
  @IsNotEmpty()
  @BusinessExists({ message: 'Invalid businessId: Business does not exist' })
  businessId: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsString()
  @IsEmail()
  senderEmail: string;
  
  @IsOptional()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  amountToInvest: string;

  @IsString()
  details: string;
  

}
