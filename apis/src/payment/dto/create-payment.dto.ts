import { IsNumber, IsOptional, isString, IsString } from "class-validator";


export class CreatePaymentDto{
  @IsString()
  businessId : string;

}