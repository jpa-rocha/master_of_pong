import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway(8002, { cors: '*' })
export class GameGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('gameEvent')
  handleGameEvent(@MessageBody() event: any): void {
    this.server.emit('gameUpdate', event);
  }
}
