import { IsMongoId } from "class-validator";

export class ApproveNdaDto{
  @IsMongoId()
  ndaId: string;

}