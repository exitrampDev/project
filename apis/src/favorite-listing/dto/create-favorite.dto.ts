import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFavoriteDto {

  @IsNotEmpty()
  @IsString()
  businessId: string;
  
    @IsOptional()
  @IsString()
  state?: string;
}
