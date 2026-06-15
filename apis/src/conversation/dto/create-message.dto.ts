import { IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
  // Array of participant user IDs (sender and optionally receiver IDs)
  @IsString()
  @IsOptional()
  senderId?: string;

  @IsString()
  toUserId!: string;

  // Message content text
  @IsString()
  message!: string;

  // Optional base64-encoded file (e.g., image)
  file?: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
