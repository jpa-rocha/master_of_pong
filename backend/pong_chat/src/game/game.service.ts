import { Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  private mapWidth = 800;
  private mapHeight = 600;
  private paddleWidth = 20;
  private paddleHeight = 100;
  private paddleSpeed = 10;
  private paddlePosition = { x: 10, y: 250 };
  private isGameStarted = false;
  private botPosition = { x: 770, y: 250 };
  private ballPosition = { x: 400, y: 300 };
  private ballVelocity = { x: 5, y: 0.5 };

  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  constructor(private readonly gameGateway: GameGateway) {}

  startMovingBall(): void {
    this.isGameStarted = true;
    if (this.ballTimer) return;

    this.ballTimer = setInterval(() => {
      this.moveBall();
    }, 10);

    this.botTimer = setInterval(() => {
      this.moveBot();
    }, 10);
  }

  stopMovingBall(): void {
    this.ballPosition.x = this.mapWidth / 2;
    this.ballPosition.y = this.mapHeight / 2;
    if (this.ballTimer) {
      clearInterval(this.ballTimer);
      this.ballTimer = null;
    }
    this.ballVelocity.x = 5;
    this.ballVelocity.y = 0.5;
    this.paddlePosition.y = 250;
    this.botPosition.y = 250;
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
    this.isGameStarted = false;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.paddlePosition.y,
      bot: this.botPosition.y,
      ball: this.ballPosition,
    });
  }

  moveUp(): void {
    if (this.isGameStarted == false) return;
    this.paddlePosition.y -= this.paddleSpeed;
    if (this.paddlePosition.y < 0) this.paddlePosition.y = 0;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.paddlePosition.y,
      bot: this.botPosition.y,
      ball: this.ballPosition,
    });
  }

  moveDown(): void {
    if (this.isGameStarted == false) return;
    this.paddlePosition.y += this.paddleSpeed;
    if (this.paddlePosition.y > this.mapHeight - this.paddleHeight)
      this.paddlePosition.y = this.mapHeight - this.paddleHeight;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.paddlePosition.y,
      bot: this.botPosition.y,
      ball: this.ballPosition,
    });
  }

  private moveBot(): void {
    if (this.isGameStarted == false) return;
    if (this.ballPosition.y > this.botPosition.y + 50) this.botPosition.y += 1;
    if (this.ballPosition.y < this.botPosition.y + 50) this.botPosition.y -= 1;

    if (this.botPosition.y < 0) this.botPosition.y = 0;
    if (this.botPosition.y > 500) this.botPosition.y = 500;
  }

  private moveBall(): void {
    if (this.isGameStarted == false) return;

    this.ballPosition.x += this.ballVelocity.x;
    this.ballPosition.y += this.ballVelocity.y;

    // Ball interaction with walls
    if (this.ballPosition.x >= this.mapWidth || this.ballPosition.x <= 0) {
      this.ballPosition.x = this.mapWidth / 2;
      this.ballPosition.y = this.mapHeight / 2;
      this.ballVelocity.x = this.ballVelocity.x * -1;
    }

    if (this.ballPosition.y >= this.mapHeight || this.ballPosition.y <= 0) {
      this.ballVelocity.y = this.ballVelocity.y * -1;
    }

    // Ball interaction with paddles
    if (
      this.ballPosition.x <= this.paddlePosition.x + this.paddleWidth &&
      this.ballPosition.y >= this.paddlePosition.y &&
      this.ballPosition.y <= this.paddlePosition.y + this.paddleHeight
    ) {
      this.ballVelocity.x = this.ballVelocity.x * -1;
      this.ballPosition.x = this.paddlePosition.x + this.paddleWidth;
    }

    if (
      this.ballPosition.x >= this.botPosition.x &&
      this.ballPosition.y >= this.botPosition.y &&
      this.ballPosition.y <= this.botPosition.y + this.paddleHeight
    ) {
      this.ballVelocity.x = this.ballVelocity.x * -1;
      this.ballPosition.x = this.botPosition.x - this.paddleWidth - 1;
    }

    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.paddlePosition.y,
      bot: this.botPosition.y,
      ball: this.ballPosition,
    });
  }
}
