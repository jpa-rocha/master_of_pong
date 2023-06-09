import { Injectable } from '@nestjs/common';

@Injectable()
export class Map {
  public Width: number;
  public Height: number;
  public ballPos: { x: number; y: number };
  public ballVel: { x: number; y: number };
  public gameStarted: boolean;

  constructor() {
    this.Width = 800;
    this.Height = 600;
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.gameStarted = false;
  }

  stopGame() {
    this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
    this.ballVel = { x: 5, y: 0.5 };
    this.gameStarted = false;
  }
}
