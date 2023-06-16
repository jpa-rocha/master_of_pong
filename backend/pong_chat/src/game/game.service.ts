import { Inject, Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Map } from './dto/map.dto';
import { Player } from './dto/player.dto';
import { ECDH } from 'crypto';

@Injectable()
export class GameService {
  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  private moveUpTimer: NodeJS.Timeout | null = null;
  private moveDownTimer: NodeJS.Timeout | null = null;

  private pressUp = 0;
  private pressDown = 0;

  private szTimer: NodeJS.Timeout | null = null;
  private timeWarpTimer: NodeJS.Timeout | null = null;
  private mirageTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly gameGateway: GameGateway,
    @Inject('Map') private readonly map: Map,
    @Inject('Player1') private readonly player1: Player,
    @Inject('Player2') private readonly player2: Player,
  ) {}

  gameStatus(): void {
    this.gameGateway.server.emit('gameStatus', {
      gameStatus: this.map.gameStarted,
    });
  }

  startGame(): void {
    if (this.map.gameStarted == true) {
      console.log('The game was already started');
      return;
    }

    // Starting game and initializing the players
    this.map.gameStarted = true;
    this.player1.setValues(10, 250, 100, 20, 5);
    this.player2.setValues(770, 250, 100, 20, 1);

    this.gameGateway.server.emit('winnerUpdate', {
      winner: '',
    });

    // Calls the moveBall function on intervals
    if (this.ballTimer || this.botTimer) return;
    this.ballTimer = setInterval(() => {
      this.moveBall();
    }, 10);

    // Calls the moveBot function on intervals
    this.botTimer = setInterval(() => {
      this.moveBot();
    }, 1);
  }

  stopGame(): void {
    if (this.map.gameStarted == false) {
      console.log('Can not end the game, it has not started yet');
      return;
    }

    // Stops calling the moveBall function
    if (this.ballTimer) {
      clearInterval(this.ballTimer);
      this.ballTimer = null;
    }

    // Stops calling the moveBot function
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }

    if (this.map.score.p1 == 11) {
      this.gameGateway.server.emit('winnerUpdate', {
        winner: 'Player1 wins',
      });
    } else if (this.map.score.p2 == 11) {
      this.gameGateway.server.emit('winnerUpdate', {
        winner: 'Player2 wins',
      });
    }

    // Reset player, ball and score
    this.map.default();
    this.player1.resetPos(this.map.Height);
    this.player2.resetPos(this.map.Height);
    this.gameGateway.server.emit('player1Update', {
      player1: this.player1.pos.y,
    });
    this.gameGateway.server.emit('player2Update', {
      player2: this.player2.pos.y,
    });
    this.gameGateway.server.emit('ballUpdate', {
      ball: this.map.ballPos,
    });
    this.gameGateway.server.emit('scoreUpdate', {
      score: this.map.score,
    });
    this.gameGateway.server.emit('gameStatus', {
      gameStatus: this.map.gameStarted,
    });
  }

  moveUpEnable(): void {
    // if (this.map.gameStarted == false) return;
    // this.player1.pos.y -= this.player1.speed;
    // if (this.player1.pos.y < 0) this.player1.pos.y = 0;
    // this.gameGateway.server.emit('player1Update', {
    //   player1: this.player1.pos.y,
    // });
    if (this.moveUpTimer) return;
    this.moveUpTimer = setInterval(() => {
      this.moveUp();
    }, 0.1);
  }

  moveUpDisable(): void {
    if (this.moveUpTimer) {
      clearInterval(this.moveUpTimer);
      this.moveUpTimer = null;
    }
  }

  moveUp(): void {
    if (this.map.gameStarted == false) return;
    this.pressUp = 1;
  }

  stopUp(): void {
    if (this.map.gameStarted == false) return;
    this.pressUp = 0;
  }

  moveDown(): void {
    if (this.map.gameStarted == false) return;
    this.pressDown = 1;
  }

  stopDown(): void {
    if (this.map.gameStarted == false) return;
    this.pressDown = 0;
  }

  ultScorpion(): void {
    this.player1.getOverHere = true;
  }

  abTimeWarp(): void {
    this.map.timeWarp = true;
  }

  ultSubZero(): void {
    this.map.freeze = true;
    this.gameGateway.server.emit('ultimateSubZero', {
      ultimate: true,
    });
  }

  abMirage(): void {
    this.map.mirage = true;
    this.gameGateway.server.emit('mirage', {
      mirage: true,
    });
  }

  SoundGrenade(): void {
    this.gameGateway.server.emit('SoundGrenade', {
      player2: this.player2.pos.y,
    });
  }

  BallSize(): void {
    this.map.ballSize *= 2;
    this.gameGateway.server.emit('BallSize', {
      ballSize: this.map.ballSize,
    });
  }

  ballReset(): void {
    this.map.ballSize = 10;
    this.gameGateway.server.emit('BallSize', {
      ballSize: this.map.ballSize,
    });
  }

  private moveBot(): void {
    if (this.map.gameStarted == false) return;

    if (this.map.ballPos.y > this.player2.pos.y + this.player2.height / 2)
      this.player2.pos.y += this.player2.speed;
    if (this.map.ballPos.y < this.player2.pos.y + this.player2.height / 2)
      this.player2.pos.y -= this.player2.speed;

    if (this.player2.pos.y < 0) this.player2.pos.y = 0;
    if (this.player2.pos.y > this.map.Height - this.player2.height)
      this.player2.pos.y = this.map.Height - this.player2.height;

    this.gameGateway.server.emit('player2Update', {
      player2: this.player2.pos.y,
    });
  }

  private revertBallSpeed(ballVelX: number, ballVelY: number): void {
    this.map.ballVel.x = ballVelX;
    this.map.ballVel.y = ballVelY;
  }

  // private ball_line_interaction(
  //   line_start: { x: number; y: number },
  //   line_end: { x: number; y: number },
  // ): boolean {
  //   const lineDirection = {
  //     x: line_end.x - line_start.x,
  //     y: line_end.y - line_start.y,
  //   };

  //   const lineToBallVec = {
  //     x: this.map.ballPos.x - line_start.x,
  //     y: this.map.ballPos.y - line_start.y,
  //   };

  //   const lineLength = Math.sqrt(lineDirection.x ** 2 + lineDirection.y ** 2);
  //   const projection =
  //     (lineToBallVec.x * lineDirection.x + lineToBallVec.y * lineDirection.y) /
  //     lineLength ** 2;

  //   const closestPoint = {
  //     x: line_start.x + projection * lineDirection.x,
  //     y: line_start.y + projection * lineDirection.y,
  //   };

  //   if (closestPoint.y >= line_start.y && closestPoint.y <= line_end.y) {
  //     const distance = Math.sqrt(
  //       (this.map.ballPos.x - closestPoint.x) ** 2 +
  //         (this.map.ballPos.y - closestPoint.y) ** 2,
  //     );
  //     if (distance <= this.map.ballSize) {
  //       const dot =
  //         (closestPoint.x - line_start.x) * lineDirection.x +
  //         (closestPoint.y - line_start.y) * lineDirection.y;
  //       if (dot >= 0 && dot <= lineLength ** 2) return true;
  //     }
  //   }
  //   return false;
  // }

  // function(line_x_coord, line_y_max, line_y_min, circle_x_coord, circle_y_coord, circle_radius) {
  //   y = sqrt(circle_radius - sq(line_x_coord - circle_x_coord)) + circle_y_coord
  //   if (y < line_y_max && y > line_y_min)
  //       intersect

  private ball_line_interaction(
    line_x: number,
    line_y: { max: number; min: number },
  ): boolean {
    const y_pos =
      this.map.ballPos.y +
      Math.sqrt(this.map.ballSize ** 2 - (line_x - this.map.ballPos.x) ** 2);
    const y_neg =
      this.map.ballPos.y -
      Math.sqrt(this.map.ballSize ** 2 - (line_x - this.map.ballPos.x) ** 2);
    if (y_pos < line_y.max && y_pos > line_y.min) return true;
    if (y_neg < line_y.max && y_neg > line_y.min) return true;
    return false;
  }

  private moveBall(): void {
    if (this.map.gameStarted == false) return;

    // Time Warp
    if (this.map.timeWarp == true) {
      if (this.timeWarpTimer) {
        clearTimeout(this.szTimer);
        this.szTimer = null;
      } else {
        this.map.ballVel.x = -this.map.ballVel.x;
        this.map.ballVel.y = -this.map.ballVel.y;
      }
      this.map.timeWarp = false;
      this.timeWarpTimer = setTimeout(() => {
        this.map.ballVel.x = -this.map.ballVel.x;
        this.map.ballVel.y = -this.map.ballVel.y;
        this.timeWarpTimer = null;
      }, 3000);
    }

    if (this.pressUp == 1) {
      this.player1.pos.y -= this.player1.speed;
      if (this.player1.pos.y < 0) this.player1.pos.y = 0;
    }
    if (this.pressDown == 1) {
      this.player1.pos.y += this.player1.speed;
      if (this.player1.pos.y > this.map.Height - this.player1.height)
        this.player1.pos.y = this.map.Height - this.player1.height;
    }

    // Sub Zero ability implementation :
    if (this.map.freeze == true) {
      if (this.szTimer) {
        clearTimeout(this.szTimer);
      } else {
        this.map.ballVelOld.x = this.map.ballVel.x;
        this.map.ballVelOld.y = this.map.ballVel.y;
        this.map.ballVel.x = 0;
        this.map.ballVel.y = 0;
      }
      this.map.freeze = false;
      this.szTimer = setTimeout(() => {
        this.map.ballVel.x = this.map.ballVelOld.x;
        this.map.ballVel.y = this.map.ballVelOld.y;
        this.gameGateway.server.emit('ultimateSubZero', {
          ultimate: false,
        });
        this.szTimer = null;
      }, 1200);
    }
    // Scorpion ability implementation :
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
    // Ball movement implementation
    this.map.ballPos.x += this.map.ballVel.x;
    this.map.ballPos.y += this.map.ballVel.y;
    // Mirage
    if (this.map.mirage) {
      this.map.mirage = false;
      if (this.mirageTimer) {
        clearTimeout(this.mirageTimer);
      }
      let index = 0;
      while (index < 8) {
        this.map.mirageBallsPos.push([
          this.map.ballPos.x + (Math.random() - 0.5) * 10,
          this.map.ballPos.y + (Math.random() - 0.5) * 10,
        ]);
        this.map.mirageBallsVel.push([
          this.map.ballVel.x + (Math.random() - 0.5) * 2,
          this.map.ballVel.y + (Math.random() - 0.5) * 2,
        ]);
        index++;
      }
      this.mirageTimer = setTimeout(() => {
        this.gameGateway.server.emit('mirage', {
          mirage: false,
        });
        this.mirageTimer = null;
        this.map.mirageBallsPos = [];
        this.map.mirageBallsVel = [];
      }, 5000);
    }
    // Ball interaction with walls

    if (this.map.ballPos.x >= this.map.Width || this.map.ballPos.x <= 0) {
      if (this.map.ballPos.x >= this.map.Width) this.map.score.p1 += 1;
      if (this.map.ballPos.x <= 0) this.map.score.p2 += 1;
      if (this.map.score.p1 == 11 || this.map.score.p2 == 11) this.stopGame();
      this.map.ballPos.x = this.map.Width / 2;
      this.map.ballPos.y = this.map.Height / 2;
      this.map.ballVel.y = -0.5;
      this.map.ballVel.x = 5;
    }

    if (
      (this.map.ballPos.y + this.map.ballSize >= this.map.Height &&
        this.map.ballVel.y > 0) ||
      (this.map.ballPos.y - this.map.ballSize <= 0 && this.map.ballVel.y < 0)
    ) {
      this.map.ballVel.y = this.map.ballVel.y * -1;
    }

    // Ball interaction with player 1
    if (
      this.map.ballVel.x <= 0 &&
      this.ball_line_interaction(this.player1.pos.x + this.player1.width, {
        max: this.player1.pos.y + this.player1.height,
        min: this.player1.pos.y,
      })
    ) {
      const lengthOld = Math.sqrt(
        this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
      );
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
      this.map.freeze = false;
      const lengthNew = Math.sqrt(
        this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
      );
      const scaleFactor = lengthOld / lengthNew;
      this.map.ballVel.x *= scaleFactor;
      this.map.ballVel.y *= scaleFactor;
    }

    // Ball interaction with player 2
    if (
      this.map.ballVel.x >= 0 &&
      this.ball_line_interaction(this.player2.pos.x, {
        max: this.player2.pos.y + this.player2.height,
        min: this.player2.pos.y,
      })
    ) {
      const lengthOld = Math.sqrt(
        this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
      );
      const maxChange = 0.5;
      let change =
        this.map.ballPos.y - (this.player2.pos.y + this.player2.height / 2);
      if (Math.abs(change) > maxChange) {
        if (change > 0) change = maxChange;
        else change = maxChange * -1;
      }
      this.map.ballVel.x = this.map.ballVel.x * -1;
      this.map.ballVel.y += change;
      const lengthNew = Math.sqrt(
        this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2,
      );
      const scaleFactor = lengthOld / lengthNew;
      this.map.ballVel.x *= scaleFactor;
      this.map.ballVel.y *= scaleFactor;
    }

    if (this.mirageTimer) {
      let i: string;
      for (i in this.map.mirageBallsPos) {
        this.map.mirageBallsPos[i][0] += this.map.mirageBallsVel[i][0];
        this.map.mirageBallsPos[i][1] += this.map.mirageBallsVel[i][1];
        if (
          this.map.mirageBallsPos[i][1] + this.map.ballSize >=
            this.map.Height ||
          this.map.mirageBallsPos[i][1] - this.map.ballSize <= 0
        ) {
          this.map.mirageBallsVel[i][1] = this.map.mirageBallsVel[i][1] * -1;
        }
        if (
          this.map.mirageBallsPos[i][0] + this.map.ballSize >= this.map.Width ||
          this.map.mirageBallsPos[i][0] - this.map.ballSize <= 0
        ) {
          this.map.mirageBallsVel[i][0] = this.map.mirageBallsVel[i][0] * -1;
        }
      }
      this.gameGateway.server.emit('mirageUpdate', {
        mirageUpdate: this.map.mirageBallsPos,
      });
    }
    this.gameGateway.server.emit('player1Update', {
      player1: this.player1.pos.y,
    });
    this.gameGateway.server.emit('ballUpdate', {
      ball: this.map.ballPos,
    });
    this.gameGateway.server.emit('scoreUpdate', {
      score: this.map.score,
    });
    this.gameGateway.server.emit('ultimateUpdate', {
      ultimate: this.player1.getOverHere,
    });
  }
}
