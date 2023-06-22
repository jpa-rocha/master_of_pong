import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Options } from './movement.dto';
// class GameService;

import { Socket } from 'socket.io-client';

@WebSocketGateway(8002, { cors: '*' })
export class GameGateway {
  constructor(
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
  ) {}
  @WebSocketServer()
  server;

  @SubscribeMessage('gameEvent')
  handleGameEvent(@MessageBody() event: any): void {
    this.server.emit('gameUpdate', event);
  }

  // handleEvent(client: Socket, data: string): string {
  //   return data;
  // }
  @SubscribeMessage('start')
  startGame(client: Socket, options: Options) {
    this.gameService.startGame(client.id, options);
  }
}
