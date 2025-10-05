import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddRecentlyDto {

  @IsNotEmpty()
  @IsString()
  businessId: string;
  
    @IsOptional()
  @IsString()
  state?: string;
}
