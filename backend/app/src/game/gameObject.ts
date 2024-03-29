import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Player } from './dto/player.dto';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Options } from './movement.dto';
import { AuthenticatedSocket } from './dto/types';
import { v4 } from 'uuid';
import { Mode } from './enums/Modes';
import { Paddles } from './enums/Paddles';
import { Character } from './enums/Characters';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class GameObject {
  public gameID: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<
    Socket['id'],
    AuthenticatedSocket
  >();
  public readonly gameService: GameService;
  public gameStarted: boolean;
  public joinTimer: NodeJS.Timeout | null = null;
  public score: { p1: number; p2: number };

  public Width: number;
  public Height: number;

  public ballSize: number;
  public ballSizeDefault: number;
  public ballPos: { x: number; y: number };
  public ballPosTarget: number;
  public ballVel: { x: number; y: number };
  public ballVelDefault: { x: number; y: number };
  public ballVelOld: { x: number; y: number };
  public ballMagnitude: number;
  public twoThirdsBallRadius: number;

  public allowAbilities: boolean;
  public freeze: boolean;
  public lightning: boolean;
  public lightningDir: number;
  public timeWarp: boolean;
  public mirage: boolean;
  public mirageNumber: number;
  public mirageSpread: number;
  public mirageBallsPos: number[][];
  public mirageBallsVel: number[][];
  public gameOptions: Options;
  public gameEnded: boolean;

  public checkGameStarted: boolean;

  public player1: Player;
  public player2: Player;
  constructor(
    private readonly server: Server,
    options: Options,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {
    this.checkGameStarted = false;
    this.gameEnded = false;
    this.gameService = new GameService(this, this.chatGateway);
    this.allowAbilities = false;
    this.Width = 1200;
    this.Height = 800;
    this.ballVelDefault = { x: 6.5, y: -0.65 };
    this.ballVel = { x: 6.5, y: -0.65 };
    this.ballSizeDefault = 15;
    this.ballSize = 15;
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.mirageNumber = 8;
    this.mirageSpread = 10;
    if (options.hyper === true) {
      this.ballVel = { x: 10, y: -0.5 };
      this.ballVelDefault = { x: 10, y: -0.5 };
      this.ballSizeDefault = 60;
      this.ballSize = 60;
    } else if (options.dodge === true) {
      this.ballVel = { x: 7, y: -0.5 };
      this.ballVelDefault = { x: 7, y: -0.5 };
      this.ballSizeDefault = 40;
      this.ballSize = 40;
      this.mirageNumber = 2;
      this.mirageSpread = 50;
    }
    this.twoThirdsBallRadius = this.ballSize * (2 / 3);
    this.ballVelOld = { x: 0, y: 0 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
    this.freeze = false;
    this.lightning = false;
    this.lightningDir = 0;
    this.ballPosTarget = 0;
    this.timeWarp = false;
    this.mirage = false;
    this.mirageBallsPos = [];
    this.mirageBallsVel = [];
    this.player1 = new Player(server, options, 1);
    this.player2 = null;
    if (options.gameMode === Mode.Singleplayer) {
      this.player2 = new Player(
        server,
        new Options(
          Mode.Singleplayer,
          Paddles.AverageJoe,
          Math.floor(Math.random() * 3) + Character.Venomtail,
          options.hyper,
          options.dodge,
        ),
      );
      this.player2.ready = true;
      this.player2.pos.x = 1160;
    }
    this.gameOptions = options;
    if (
      this.gameOptions.gameMode === Mode.Singleplayer ||
      this.gameOptions.gameMode === Mode.MasterOfPong
    )
      this.allowAbilities = true;
  }

  default() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
    this.player1.pos.x = 20;
    this.player1.pos.y = 350;
    this.player2.pos.x = 1160;
    this.player2.pos.y = 350;
  }

  setGameID(gameID: string) {
    this.gameID = gameID;
  }

  async getUser(databaseId: string) {
    return await this.chatGateway.getUserName(databaseId);
  }
  addClient(client: AuthenticatedSocket, databaseId: string) {
    this.clients.set(client.id, client);
    client.join(this.gameID);
    client.data.lobby = this;
    if (!this.player1.id) {
      this.player1.id = client.id;
      this.player1.databaseId = databaseId;
    } else if (!this.player2.id) {
      this.player2.id = client.id;
      this.player2.databaseId = databaseId;
    }
    if (
      (this.clients.size === 1 &&
        this.player1.options.gameMode === Mode.Singleplayer) ||
      this.clients.size === 2
    ) {
      this.gameService.initGame();
    }
  }

  removeClient(client: AuthenticatedSocket) {
    this.clients.delete(client.id);
    client.data.lobby = null;
    this.gameService.stopGame(client.id);
  }

  rejoin(client: AuthenticatedSocket) {
    let playerNo: number;
    let playerAbility: number;
    if (this.player1.id === client.id) {
      playerNo = 1;
      playerAbility = this.player1.ability;
    } else {
      playerNo = 2;
      playerAbility = this.player2.ability;
    }
    if (this.player2) {
      let username2;
      if (this.gameOptions.gameMode === Mode.Singleplayer) username2 = 'Bot';
      else username2 = this.player2.user.username;
      const payload = {
        mode: this.gameOptions.gameMode,
        hyper: this.gameOptions.hyper,
        dodge: this.gameOptions.dodge,
        player: playerNo,
        ability: playerAbility,
        player1Character: this.player1.options.character,
        player1Size: this.player1.options.paddle,
        player1X: this.player1.pos.x,
        player1Y: this.player1.pos.y,
        player1Name: this.player1.user.username,
        player2Character: this.player2.options.character,
        player2Size: this.player2.options.paddle,
        player2X: this.player2.pos.x,
        player2Y: this.player2.pos.y,
        player2Name: username2,
        score: this.score,
        ballSize: this.ballSize,
        checkGameStarted: this.checkGameStarted,
      };
      this.server.to(client.id).emit('Game Info', payload);
    } else {
      const payload = {
        mode: this.gameOptions.gameMode,
        hyper: this.gameOptions.hyper,
        dodge: this.gameOptions.dodge,
        player: playerNo,
        ability: playerAbility,
        player1Character: this.player1.options.character,
        player1Size: this.player1.options.paddle,
        player1X: this.player1.pos.x,
        player1Y: this.player1.pos.y,
        player1Name: '',
        player2Character: 0,
        player2Size: 0,
        player2X: 0,
        player2Y: 0,
        player2Name: '',
        score: this.score,
        ballSize: this.ballSize,
      };
      if (!this.gameEnded) this.server.to(client.id).emit('Game Info', payload);
    }
    if (client.id == this.player1.id) {
      this.server.to(this.player1.id).emit('hasAbility', {
        hasAbility: this.player1.hasAbility,
        ability: this.player1.ability,
      });
      this.server.to(this.player1.id).emit('hasUlt', {
        hasUlt: this.player1.hasSpecial,
      });
    } else if (client.id == this.player2.id) {
      this.server.to(this.player2.id).emit('hasAbility', {
        hasAbility: this.player2.hasAbility,
        ability: this.player2.ability,
      });
      this.server.to(this.player2.id).emit('hasUlt', {
        hasUlt: this.player2.hasSpecial,
      });
    }
  }

  sendToPlayer1<T>(event: any, payload: T) {
    this.server.to(this.player1.id).emit(event, payload);
  }

  sendToPlayer2<T>(event: any, payload: T) {
    this.server.to(this.player2.id).emit(event, payload);
  }

  sendToClients<T>(event: any, payload: T) {
    this.server.to(this.gameID).emit(event, payload);
  }
}
