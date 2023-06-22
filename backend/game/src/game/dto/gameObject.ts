import { Map } from './map.dto';
import { Player } from './player.dto';
import { Injectable } from '@nestjs/common';
import { Options } from '../movement.dto';

@Injectable()
export class gameObject {
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

  // // Game ID
  // public gameID: number;
  // Map
  public map: Map;
  // player1
  public player1: Player;
  // player2
  public player2: Player;
  constructor(player: Player) {
    // const uuidv4 = require('uuid/v4');
    // gameID = uuidv4();
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
    this.player1 = player;
    this.player2 = null;
    this.gameOptions = player.options;
    if (
      this.gameOptions.gameMode === 'SinglePlayer' ||
      this.gameOptions.gameMode === 'Master Of Pong'
    )
      this.allowAbilities = true;
  }

  default() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
  }

  // setGameOptions(gameOptions: Options) {
  //   this.gameOptions = gameOptions;
  // }

  setPlayer2(player: Player) {
    this.player2 = player;
  }
}
