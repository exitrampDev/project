import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { ConversationService } from "./conversation.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

   @UseGuards(JwtAuthGuard)
  @Get('my-conversations')
    async findAll(@User() user: any) {
      return this.conversationService.findAllMyConversations(user);
    }

   @UseGuards(JwtAuthGuard)
  @Get(':id/history')
    async findAllChatHistory(@User() user: any, @Param('id') id: string) {
      return this.conversationService.findAllChatHistory(id);
    }
  

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @User() user: any) {
    return this.conversationService.sendMessage(createMessageDto, user);
  }
}
