import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePageDto {
  @IsOptional() 
  @IsString()
  pageSlug?: string;

  @IsNotEmpty()
  @IsString()
  pageContent: string;


}
