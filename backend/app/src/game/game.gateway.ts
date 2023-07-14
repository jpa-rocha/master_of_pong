import {
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
import { UsersService } from 'src/users/users.service';
import { GameDataService } from 'src/game-data/game-data.service';
import { CreateGameDto } from 'src/game-data/dto/create-game.dto';
import { User } from 'src/users/entities/user.entity';
import { Req } from '@nestjs/common';
import { parse } from 'cookie';

@WebSocketGateway(8002, { cors: '*' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly gameCollection: GameCollection,
    private usersService: UsersService,
    private gameDataService: GameDataService,
  ) {}

  afterInit(server: Server): any {
    // Pass server instance to managers
    this.gameCollection.server = server;

    // this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket): Promise<void> {
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

  @SubscribeMessage('moveEnable')
  gameMoveEnable(client: AuthenticatedSocket, direction: number): void {
    this.gameCollection.moveEnable(client, direction);
  }

  @SubscribeMessage('moveDisable')
  gameMoveDisable(client: AuthenticatedSocket, direction: number): void {
    this.gameCollection.moveDisable(client, direction);
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

  @SubscribeMessage('loadWindow')
  loadWindow(client: AuthenticatedSocket): void {
    this.server.to(client.id).emit('loadWindow', true);
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

  async addGameData(p1: number, p2: number, winner: number, date: Date) {
    const gameDataDto: CreateGameDto = {
      userOne: await this.usersService.findOne(p1),
      userTwo: await this.usersService.findOne(p2),
      winner: await this.usersService.findOne(winner),
      timestamp: date,
    };
    await this.gameDataService.create(gameDataDto);
  }
}
