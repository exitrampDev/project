import { IsNumber, IsOptional, isString, IsString } from "class-validator";


export class CreatePaymentDto{
  @IsString()
  transactionId : string;

  @IsNumber()
  amount : number;

  @IsOptional()
  @IsString()
  message? : string;
}