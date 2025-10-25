import { IsString, IsNotEmpty } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
