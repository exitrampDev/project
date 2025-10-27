import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsOptional()
  author: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  createdBy: string;
}
