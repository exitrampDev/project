import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsOptional() 
  @IsString()
  pageSlug!: string;

  @IsNotEmpty()
  @IsString()
  pageContent!: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()

  categories!: [string];

  @IsNotEmpty()
 
  tags!: [string];

  @IsNotEmpty()
  @IsString()
  tool!: string;

  @IsNotEmpty()
  @IsString()
  summary!: string;

}
