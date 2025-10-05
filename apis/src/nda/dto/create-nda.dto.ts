// src/nda/dto/create-nda.dto.ts
import { IsMongoId } from 'class-validator';

export class CreateNdaDto {
  @IsMongoId()
  businessId: string;
}
