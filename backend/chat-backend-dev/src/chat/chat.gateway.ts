import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { AppService } from '../app.service';
import { Socket } from 'socket.io';
import { Server } from "socket.io";

@WebSocketGateway(8001, { cors: "*" })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly appService: AppService) {}
  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string ): void {
    console.log(message);
    this.server.emit('message', message);
  }
  // this is a comment
  
handleConnection(client: Socket) {
  // console.log(`User ${username} connected`);
  this.server.emit('user connected');
  // client.username = username;
}

handleDisconnect(client: Socket) {
  // console.log(`User ${client.username} disconnected`);
  this.server.emit('user disconnected');
}
/*   
  show user connected with ID
  handleConnection(client: Socket) {
    console.log(`User ${client.id} connected`);
    this.server.emit("user connected", client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.id} disconnected`);
    this.server.emit("user disconnected", client.id);
  } */
}
