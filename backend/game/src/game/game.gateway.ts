import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Options } from './movement.dto';
import { GameCollection } from './gameCollection';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './dto/types';

@WebSocketGateway(8002, { cors: '*' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameCollection: GameCollection) {}

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

  @SubscribeMessage('moveDownEnable')
  gameMoveDownEnable(client: AuthenticatedSocket): void {
    this.gameCollection.moveDownEnable(client);
  }

  @SubscribeMessage('moveDownDisable')
  gameMoveDownDisable(client: AuthenticatedSocket): void {
    this.gameCollection.moveDownDisable(client);
  }

  @SubscribeMessage('moveUpEnable')
  gameMoveUpEnable(client: AuthenticatedSocket): void {
    this.gameCollection.moveUpEnable(client);
  }

  @SubscribeMessage('moveUpDisable')
  gameMoveUpDisable(client: AuthenticatedSocket): void {
    this.gameCollection.moveUpDisable(client);
  }

  @SubscribeMessage('specialAbility')
  gameUseSpecial(client: AuthenticatedSocket): void {
    this.gameCollection.useSpecial(client);
  }

  // TODO WORK ON gameobject.allowAbilities

  @SubscribeMessage('randomAbility')
  gameUseAbility(client: AuthenticatedSocket): void {
    this.gameCollection.useAbility(client);
  }

  @SubscribeMessage('readyToPlay')
  readyToPlay(client: AuthenticatedSocket): void {
    this.gameCollection.playerReady(client);
  }

  // Start move up
  // Stop move up
  // Start move down
  // Stop move down
  // Character Special abilities
  // Random abilities

  // handleEvent(client: Socket, data: string): string {
  //   return data;
  // }
  @SubscribeMessage('start')
  initGame(client: AuthenticatedSocket, options: Options) {
    console.log('start message received...');
    this.gameCollection.createGame(client, options);
    console.log(this.gameCollection.totalGameCount);
    // game.addClient(client);
    // this.gameCollection.joinGame(game.gameID, client);
    // this.gameService.startGame(client.id, options);
  }
}
