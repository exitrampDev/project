import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UniqueInCollection } from 'src/common/decorators/unique-in-collection.validator';

export class CreateBlogDto {
  @IsOptional() 
  @IsString()
 @UniqueInCollection({ collection: 'blogs', field: 'pageSlug', message: 'slug must be unique' })
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

  @IsNotEmpty()
  @IsString()
  author!: string;

   // Base64 Image
  @IsOptional()
  @IsString()
  thumbnail!: string

}
