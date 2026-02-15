import { IsNumber, IsOptional, isString, IsString, MinLength, Validate } from "class-validator";
import { PaymentExists, PaymentExistsValidator } from "src/common/decorators/payment-exists.validator";


export class RefundApproveDto{
  
  
  @IsString()
  @PaymentExists({ message: 'Invalid paymentId: Payment does not exist' })
  paymentId : string;

  @IsString()
  @MinLength(10, { message: 'Please provide a more detailed comment by admin' })
  commentByAdmin : string;


}