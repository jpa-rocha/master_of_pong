import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: { userName: string; socketID: string }[] = [];

  handleConnection(socket: Socket) {
    console.log(`⚡: ${socket.id} user just connected!`);
  }

  handleDisconnect(socket: Socket) {
    console.log('🔥: A user disconnected');
    this.users = this.users.filter((user) => user.socketID !== socket.id);
    this.server.emit('newUserResponse', this.users);
    socket.disconnect();
  }

  @SubscribeMessage('message')
  handleMessage(socket: Socket, data: any) {
    this.server.emit('messageResponse', data);
  }

  @SubscribeMessage('newUser')
  handleNewUser(socket: Socket, data: any) {
    this.users.push(data);
    this.server.emit('newUserResponse', this.users);
  }
}
