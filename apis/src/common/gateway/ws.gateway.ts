import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: true,
})
export class MqttGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('🔌 Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('❌ Client disconnected:', client.id);
  }

  // ✅ Custom method to emit messages
  emitMessage(topic: string, payload: any) {
    this.server.emit('mqtt_message', { topic, payload });
  }
}
