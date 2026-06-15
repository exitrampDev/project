import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConversationService } from "./conversation.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @User() user: any) {
    return this.conversationService.sendMessage(createMessageDto, user);
  }
}
