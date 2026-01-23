import { IsObject, IsOptional } from "class-validator";

export class ProfileDto {
  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}
