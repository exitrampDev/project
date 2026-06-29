import { IsOptional, IsString, Matches } from "class-validator";

export class CreateMessageDto {
  // Array of participant user IDs (sender and optionally receiver IDs)
  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsString()
  toUserId?: string;

  // Message content text
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpg|jpeg|gif);base64,/, { message: 'Invalid image format' })
  file?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
