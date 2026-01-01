// src/nda/dto/create-nda.dto.ts
import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator';

export class CreateNdaDto {
  @IsMongoId()
  businessId: string;


  @IsString()
  @Matches(/^data:image\/(png|jpeg|jpg);base64,/, {
  message: 'Invalid Buyer Signature',
})
  buyerSignature?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpeg|jpg);base64,/, {
  message: 'Invalid Base64 image format',
})
  sellerSignature?: string;

  @IsOptional()
  @IsString()
  agreedDocument?: string;
}
