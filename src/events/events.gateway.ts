// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3001, { transports: ['websocket'] }) // Set the port and transport (optional)
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  // Called after the WebSocket server is initialized
  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket server initialized');
  }

  // Called when a new client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Called when a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Create an event listener for the `message` event
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    console.log('Received message:', data);
    return 'Message received!';
  }
}
