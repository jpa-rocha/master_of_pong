import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AppService } from './app.service';
import { Chat } from './chat.entity';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  arrowDown = 0;
  arrowUp = 0;
  pos_x = 778;
  pos_y = 25;
  constructor(private appService: AppService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: Chat): Promise<void> {
    await this.appService.createMessage(payload);
    this.server.emit('recMessage', payload);
  }

  @SubscribeMessage('sendEvent')
  async handleSendEvent(client: Socket, data: unknown): Promise<void> {
    //console.log(data);
  }

  @SubscribeMessage('keydown')
  keyDownEvent(client: Socket, payload: String) {
    if (payload === 'ArrowDown') this.arrowDown = 1;
    if (payload === 'ArrowUp') this.arrowUp = 1;
  }

  @SubscribeMessage('keyup')
  keyUpEvent(client: Socket, payload: String) {
    if (payload === 'ArrowDown') this.arrowDown = 0;
    if (payload === 'ArrowUp') this.arrowUp = 0;
  }

  afterInit(server: Server) {
    console.log(server);
    //Do stuffs
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    //Do stuffs
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected ${client.id}`);
    //Do stuffs
  }
}
