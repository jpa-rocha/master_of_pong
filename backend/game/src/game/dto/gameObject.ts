import { Server, Socket } from 'socket.io';
import { GameService } from '../game.service';
import { Player } from './player.dto';
import { Injectable } from '@nestjs/common';
import { Options } from '../movement.dto';
import { AuthenticatedSocket } from './types';
import { v4 } from 'uuid';

@Injectable()
export class gameObject {
  public readonly gameID: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<
    Socket['id'],
    AuthenticatedSocket
  >();
  public readonly gameService = new GameService(this);
  public gameStarted: boolean;
  public score: { p1: number; p2: number };

  public Width: number;
  public Height: number;

  public ballSize: number;
  public ballPos: { x: number; y: number };
  public ballPosTarget: number;
  public ballVel: { x: number; y: number };
  public ballVelOld: { x: number; y: number };

  public allowAbilities: boolean;
  public freeze: boolean;
  public lightning: boolean;
  public lightningDir: number;
  public timeWarp: boolean;
  public mirage: boolean;
  public mirageBallsPos: number[][];
  public mirageBallsVel: number[][];
  public gameOptions: Options;

  // player1
  public player1: Player;
  // player2
  public player2: Player;
  constructor(private readonly server: Server, options: Options) {
    this.allowAbilities = false;
    this.Width = 1200;
    this.Height = 800;
    this.ballSize = 15;
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: -0.5 };
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
    this.player1 = new Player();
    this.player2 = new Player();
    this.player1.options = options;
    this.player2.options = options;
    // this.gameOptions = player.options;
    // if (
    //   this.gameOptions.gameMode === 'SinglePlayer' ||
    //   this.gameOptions.gameMode === 'Master Of Pong'
    // )
    //   this.allowAbilities = true;
  }

  default() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
  }

  addClient(client: AuthenticatedSocket) {
    this.clients.set(client.id, client);
    client.join(this.gameID);
    client.data.lobby = this;
    if (
      (this.clients.size === 1 &&
        this.player1.options.gameMode === 'SinglePlayer') ||
      this.clients.size === 2
    ) {
      this.gameService.startGame();
    }
    // this.sendToClients
  }

  removeClient(client: AuthenticatedSocket) {
    this.clients.delete(client.id);
    client.data.lobby = null;
    this.gameService.stopGame();
    this.sendToClients('game message', {
      message: 'Opponent has left the game.',
    });
  }

  sendToPlayer1<T>(event: any, payload: T) {
    this.clients[0].emit(event, payload);
  }

  sendToPlayer2<T>(event: any, payload: T) {
    this.clients[1].emit(event, payload);
  }

  sendToClients<T>(event: any, payload: T) {
    this.server.to(this.gameID).emit(event, payload);
  }
}

// Receive / Set game options
