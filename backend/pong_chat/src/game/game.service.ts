import { Inject, Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Map } from './dto/map.dto';
import { Player } from './dto/player.dto';
import { max } from 'rxjs';

@Injectable()
export class GameService {
  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly gameGateway: GameGateway,
    @Inject('Map') private readonly map: Map,
    @Inject('Player1') private readonly player1: Player,
    @Inject('Player2') private readonly player2: Player,
  ) {}

  startMovingBall(): void {
    this.map.gameStarted = true;
    // TODO handle taking the player parameters from the frontend
    this.player1.setValues(10, 250, 100, 20, 10);
    this.player2.setValues(770, 250, 100, 20, 1);

    if (this.ballTimer || this.botTimer) return;
    this.ballTimer = setInterval(() => {
      this.moveBall();
    }, 10);

    this.botTimer = setInterval(() => {
      this.moveBot();
    }, 1);
  }

  stopMovingBall(): void {
    this.map.stopGame();
    this.player1.resetPos(this.map.Height);
    this.player2.resetPos(this.map.Height);

    if (this.ballTimer) {
      clearInterval(this.ballTimer);
      this.ballTimer = null;
    }
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.player1.pos.y,
      bot: this.player2.pos.y,
      ball: this.map.ballPos,
      ultimate: this.player1.getOverHere,
    });
  }

  moveUp(): void {
    if (this.map.gameStarted == false) return;

    this.player1.pos.y -= this.player1.speed;
    if (this.player1.pos.y < 0) this.player1.pos.y = 0;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.player1.pos.y,
      bot: this.player2.pos.y,
      ball: this.map.ballPos,
      ultimate: this.player1.getOverHere,
    });
  }

  moveDown(): void {
    if (this.map.gameStarted == false) return;

    this.player1.pos.y += this.player1.speed;
    if (this.player1.pos.y > this.map.Height - this.player1.height)
      this.player1.pos.y = this.map.Height - this.player1.height;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.player1.pos.y,
      bot: this.player2.pos.y,
      ball: this.map.ballPos,
      ultimate: this.player1.getOverHere,
    });
  }

  ultScorpion(): void {
    this.player1.getOverHere = true;
  }

  private moveBot(): void {
    //if (this.map.gameStarted == false) return;

    if (this.map.ballPos.y > this.player2.pos.y + this.player2.height / 2)
      this.player2.pos.y += this.player2.speed;
    if (this.map.ballPos.y < this.player2.pos.y + this.player2.height / 2)
      this.player2.pos.y -= this.player2.speed;

    if (this.player2.pos.y < 0) this.player2.pos.y = 0;
    if (this.player2.pos.y > this.map.Height - this.player2.height)
      this.player2.pos.y = this.map.Height - this.player2.height;
    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.player1.pos.y,
      bot: this.player2.pos.y,
      ball: this.map.ballPos,
      ultimate: this.player1.getOverHere,
    });
  }

  private moveBall(): void {
    if (this.map.gameStarted == false) return;

    // TODO implement Get Over Here (changes the velocity to go to the center of the player)
    if (this.player1.getOverHere == true) {
      const speed = Math.sqrt(
        this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
      );
      const target = {
        x: this.player1.pos.x + this.player1.width,
        y: this.player1.pos.y + this.player1.height / 2,
      };
      const targetVector = {
        x: target.x - this.map.ballPos.x,
        y: target.y - this.map.ballPos.y,
      };
      const magnitude = Math.sqrt(targetVector.x ** 2 + targetVector.y ** 2);
      targetVector.x = (targetVector.x / magnitude) * speed;
      targetVector.y = (targetVector.y / magnitude) * speed;
      this.map.ballVel = targetVector;
    }

    this.map.ballPos.x += this.map.ballVel.x;
    this.map.ballPos.y += this.map.ballVel.y;

    // Ball interaction with walls
    if (this.map.ballPos.x >= this.map.Width || this.map.ballPos.x <= 0) {
      this.map.ballPos.x = this.map.Width / 2;
      this.map.ballPos.y = this.map.Height / 2;
      this.map.ballVel.x = this.map.ballVel.x * -1;
      this.map.ballVel.y = 1;
    }

    if (this.map.ballPos.y >= this.map.Height || this.map.ballPos.y <= 0) {
      this.map.ballVel.y = this.map.ballVel.y * -1;
    }

    // Ball interaction with paddles

    // interaction with player 1
    if (
      this.map.ballVel.x <= 0 &&
      this.map.ballPos.x >= this.player1.pos.x &&
      this.map.ballPos.x <= this.player1.pos.x + this.player1.width &&
      this.map.ballPos.y >= this.player1.pos.y &&
      this.map.ballPos.y <= this.player1.pos.y + this.player1.height
    ) {
      const maxChange = 0.5;
      let change =
        this.map.ballPos.y - (this.player1.pos.y + this.player1.height / 2);
      if (Math.abs(change) > maxChange) {
        if (change > 0) change = maxChange;
        else change = maxChange * -1;
      }
      this.map.ballVel.x = this.map.ballVel.x * -1;
      this.map.ballVel.y += change;
      this.player1.getOverHere = false;
    }

    // interaction with player 2
    if (
      this.map.ballVel.x >= 0 &&
      this.map.ballPos.x >= this.player2.pos.x &&
      this.map.ballPos.x <= this.player2.pos.x + this.player2.width &&
      this.map.ballPos.y >= this.player2.pos.y &&
      this.map.ballPos.y <= this.player2.pos.y + this.player2.height
    ) {
      const maxChange = 0.5;
      let change =
        this.map.ballPos.y - (this.player2.pos.y + this.player2.height / 2);
      if (Math.abs(change) > maxChange) {
        if (change > 0) change = maxChange;
        else change = maxChange * -1;
      }
      this.map.ballVel.x = this.map.ballVel.x * -1;
      this.map.ballVel.y += change;
    }

    this.gameGateway.server.emit('gameUpdate', {
      paddle: this.player1.pos.y,
      bot: this.player2.pos.y,
      ball: this.map.ballPos,
      ultimate: this.player1.getOverHere,
    });
  }
}
