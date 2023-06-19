import { Injectable } from '@nestjs/common';

@Injectable()
export class Map {
  public Width: number;
  public Height: number;
  public ballSize: number;
  public ballPos: { x: number; y: number };
  public ballPosTarget: number;
  public ballVel: { x: number; y: number };
  public ballVelOld: { x: number; y: number };
  public score: { p1: number; p2: number };
  public gameStarted: boolean;
  public freeze: boolean;
  public lightning: boolean;
  public lightningDir: number;
  public timeWarp: boolean;
  public mirage: boolean;
  public mirageBallsPos: number[][];
  public mirageBallsVel: number[][];

  constructor() {
    this.Width = 800;
    this.Height = 600;
    this.ballSize = 10;
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
  }

  default() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
  }
}
