import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationService } from './conversation.service';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';
import { UseGuards } from '@nestjs/common';


@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ConversationGateway  {
  @WebSocketServer()
  server!: Server;
   constructor(private readonly conversationService: ConversationService) {}

  // user joins a conversation room
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    console.log(`Client ${client.id} joined conversation ${data.conversationId}`);
    return { event: 'joined', conversationId: data.conversationId };
  }

  // send message to a conversation
  @SubscribeMessage('sendMessage')
  async handleSendMessage( @MessageBody() data: any,  @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.user) {
        console.log('Unauthorized socket connection attempt:', client.id);
        throw new WsException('Unauthorized socket');
        }
    let user = client.data.user; // if you attach auth later
    user.userId = user.sub; // if your JWT payload uses 'sub' for user ID, adjust as needed
console.log('Received message from client:', data, 'User:', user);
const mesageData = {message:data.text, conversationId:data.conversationId, senderId:user.sub};
console.log('Constructed message data:', mesageData);
    const message = await this.conversationService.sendMessage(mesageData, user);

    // broadcast to conversation room
    this.server
      .to(message.conversationId.toString())
      .emit('newMessage', message);

    return message;
  }
}