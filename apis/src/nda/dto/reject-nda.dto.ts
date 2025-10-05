import { IsMongoId } from 'class-validator';

export class RejectNdaDto {
  @IsMongoId()
  ndaId: string; 
}