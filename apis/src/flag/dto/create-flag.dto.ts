import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFlagDto {
  @IsOptional() // <-- because userId will come from token
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  businessId: string;
}
