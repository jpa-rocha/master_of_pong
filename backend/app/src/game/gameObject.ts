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
import { GameGateway } from './game.gateway';

@Injectable()
export class GameObject {
  public readonly gameID: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<
    Socket['id'],
    AuthenticatedSocket
  >();
  public readonly gameService: GameService;
  public gameStarted: boolean;
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

  // player1
  public player1: Player;
  // player2= new
  public player2: Player;
  constructor(
    private readonly server: Server,
    options: Options,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,
  ) {
    this.gameService = new GameService(this, this.gameGateway);
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

  addClient(client: AuthenticatedSocket) {
    console.log('adding client...');
    this.clients.set(client.id, client);
    client.join(this.gameID);
    client.data.lobby = this;
    if (!this.player1.id) this.player1.id = client.id;
    else if (!this.player2.id) this.player2.id = client.id;
    if (
      (this.clients.size === 1 &&
        this.player1.options.gameMode === Mode.Singleplayer) ||
      this.clients.size === 2
    ) {
      console.log('starting game...');
      this.gameService.initGame();
    }
    // this.sendToClients
  }

  removeClient(client: AuthenticatedSocket) {
    this.clients.delete(client.id);
    client.data.lobby = null;
    this.gameService.stopGame();
    // this.gameService.winner
    this.sendToClients('winnerUpdate', {
      winner: 'Opponent has left the game.',
    });
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

// Receive / Set game options
