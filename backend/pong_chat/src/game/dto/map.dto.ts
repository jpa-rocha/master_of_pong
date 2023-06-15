import { Injectable } from '@nestjs/common';

@Injectable()
export class Map {
  public Width: number;
  public Height: number;
  public ballSize: number;
  public ballPos: { x: number; y: number };
  public ballVel: { x: number; y: number };
  public score: { p1: number; p2: number };
  public gameStarted: boolean;

  constructor() {
    this.Width = 800;
    this.Height = 600;
    this.ballSize = 10;
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: -0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
  }

  default() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.score = { p1: 0, p2: 0 };
    this.gameStarted = false;
  }
}
