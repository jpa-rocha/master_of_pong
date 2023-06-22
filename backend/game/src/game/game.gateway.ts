import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Options } from './movement.dto';
import { GameCollection } from './gameCollection';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './dto/types';

@WebSocketGateway(8002, { cors: '*' })
export class GameGateway {
  constructor(
    private readonly gameCollection: GameCollection,
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
  ) {}

  afterInit(server: Server): any {
    // Pass server instance to managers
    this.gameCollection.server = server;

    // this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    // Call initializers to set up socket
    this.gameCollection.initialiseSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    // Handle termination of socket
    this.gameCollection.terminateSocket(client);
  }

  @WebSocketServer()
  server;

  // @SubscribeMessage('Find Match')
  // onLobbyCreate(client: AuthenticatedSocket, data: LobbyCreateDto): WsResponse<ServerPayloads[ServerEvents.GameMessage]>
  // {
  //   const lobby = this.lobbyManager.createLobby(data.mode, data.delayBetweenRounds);
  //   lobby.addClient(client);

  //   return {
  //     event: ServerEvents.GameMessage,
  //     data: {
  //       color: 'green',
  //       message: 'Lobby created',
  //     },
  //   };
  // }

  @SubscribeMessage('gameEvent')
  handleGameEvent(@MessageBody() event: any): void {
    this.server.emit('gameUpdate', event);
  }

  // handleEvent(client: Socket, data: string): string {
  //   return data;
  // }
  @SubscribeMessage('start')
  startGame(client: AuthenticatedSocket, options: Options) {
    const game = this.gameCollection.createGame(options);
    game.addClient(client);
    this.gameCollection.joinGame(game.gameID, client);
    // this.gameService.startGame(client.id, options);
  }
}
