import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator';

export class ApproveNdaDto{
  @IsMongoId()
  ndaId: string;

  
    @IsString()
    @Matches(/^data:image\/(png|jpeg|jpg);base64,/, {
    message: 'Invalid Seller Signature',
  })
    sellerSignature?: string;

}