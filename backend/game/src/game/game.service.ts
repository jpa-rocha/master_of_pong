import { Inject, Injectable } from '@nestjs/common';
import { Player } from './dto/player.dto';
import { Options } from './movement.dto';
import { gameObject } from './dto/gameObject';
import { GameCollection } from './gameCollection';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class GameService {
  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  private moveUpTimer: NodeJS.Timeout | null = null;
  private moveDownTimer: NodeJS.Timeout | null = null;

  private pressUp = 0;
  private pressDown = 0;
  private freezeBot = false;
  private testTemp = 0;

  private szTimer: NodeJS.Timeout | null = null;
  private timeWarpTimer: NodeJS.Timeout | null = null;
  private mirageTimer: NodeJS.Timeout | null = null;
  private freezeTimer: NodeJS.Timeout | null = null;
  private shrinkTimer: NodeJS.Timeout | null = null;
  private abilityTimer: NodeJS.Timeout | null = null;
  private ultimateTimer: NodeJS.Timeout | null = null;

  private gameCollection = new GameCollection();

  constructor(private readonly gameObject: gameObject) {}

  // gameStatus(): void {
  //   this.gameGateway.server.emit('gameStatus', {
  //     gameStatus: this.gameObject.gameStarted,
  //   });
  // }
  // createGameObject(options: Options): void {
  //   // this.gameObject.setGameOptions(options);
  //   if (options.gameMode === 'Regular Pong')
  //     this.gameObject.allowAbilities = false;
  //   else this.gameObject.allowAbilities = true;
  //   if (options.paddle === 'Small') {
  //     this.player1.height = 50;
  //     this.player1.width = 10;
  //     this.player1.speed = 15;
  //   } else if (options.paddle === 'Average Joe') {
  //     this.player1.height = 100;
  //   } else if (options.paddle === 'Big Pete') {
  //     this.player1.height = 160;
  //     this.player1.width = 32;
  //     this.player1.speed = 4;
  //   }
  // }

  // SENDING TO THE CLIENT : --------------------------------------------------------
  // this.gameObject.sendToClients<{}>('', {});
  // SENDING TO THE CLIENT : --------------------------------------------------------

  startGame(): void {
    console.log('GAME START FUNCTION CALLED');
    this.gameObject.sendToClients<{
      playerCharacter: string;
      playerSize: string;
    }>('playerCharacter', {
      playerCharacter: 'Scorpion',
      playerSize: 'Average Joe',
    });

    if (this.ballTimer || this.botTimer) return;
    this.ballTimer = setInterval(() => {
      this.moveBall();
    }, 10);

    // if (this.gameObject.gameOptions.gameMode === 'Regular Pong') {
    this.botTimer = setInterval(() => {
      this.moveBot();
    }, 1);
    // }
  }

  stopGame(): void {
    if (this.gameObject.gameStarted == false) {
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

    // Reset player, ball and score
    this.gameObject.default();
    this.gameObject.player1.resetPos(this.gameObject.Height);
    this.gameObject.player2.resetPos(this.gameObject.Height);

    this.gameObject.sendToClients<{ player1: number }>('player1Update', {
      player1: this.gameObject.player1.pos.y,
    });
    this.gameObject.sendToClients<{ player2: number }>('player2Update', {
      player2: this.gameObject.player2.pos.y,
    });
    this.gameObject.sendToClients<{ ball: { x: number; y: number } }>(
      'ballUpdate',
      {
        ball: this.gameObject.ballPos,
      },
    );
    this.gameObject.sendToClients<{ score: { p1: number; p2: number } }>(
      'player2Update',
      {
        score: this.gameObject.score,
      },
    );
    this.gameObject.sendToClients<{ gameStatus: boolean }>('gameStatus', {
      gameStatus: this.gameObject.gameStarted,
    });
  }

  moveUpEnable(): void {
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
    if (this.gameObject.gameStarted == false) return;
    this.pressUp = 1;
  }

  stopUp(): void {
    if (this.gameObject.gameStarted == false) return;
    this.pressUp = 0;
  }

  moveDown(): void {
    if (this.gameObject.gameStarted == false) return;
    this.pressDown = 1;
  }

  stopDown(): void {
    if (this.gameObject.gameStarted == false) return;
    this.pressDown = 0;
  }

  setAbility(player: Player): void {
    this.gameObject.player1.hasAbility = false;
    this.gameObject.sendToClients<{ hasAbility: boolean }>('hasAbility', {
      hasAbility: false,
    });

    let seconds = 14;
    const abilityTimer = setInterval(() => {
      this.gameObject.sendToClients<{ secondsLeft: number }>('secondsLeft', {
        secondsLeft: seconds,
      });
      if (seconds === 1) {
        clearInterval(abilityTimer);
        return;
      }
      seconds--;
    }, 1000);
    player.ability = Math.floor(Math.random() * 5);
    setTimeout(() => {
      player.hasAbility = true;
      this.gameObject.sendToClients<{ hasAbility: boolean; ability: number }>(
        'hasAbility',
        { hasAbility: true, ability: player.ability },
      );
    }, 15000);
  }

  setSpecial(player: Player): void {
    this.gameObject.player1.hasSpecial = false;

    this.gameObject.sendToClients<{ hasUlt: boolean }>('hasUlt', {
      hasUlt: false,
    });
    let seconds = 14;
    const ultimateTimer = setInterval(() => {
      this.gameObject.sendToClients<{ secondsLeftUlt: number }>(
        'secondsLeftUlt',
        { secondsLeftUlt: seconds },
      );
      if (seconds === 1) {
        clearInterval(ultimateTimer);
        return;
      }
      seconds--;
    }, 1000);
    setTimeout(() => {
      player.hasSpecial = true;
      this.gameObject.sendToClients<{ hasUlt: boolean }>('hasUlt', {
        hasUlt: true,
      });
    }, 15000);
  }

  ultScorpion(): void {
    this.gameObject.player1.getOverHere = true;
  }

  abTimeWarp(): void {
    this.gameObject.timeWarp = true;
  }

  abFreeze(): void {
    this.gameObject.freeze = true;
    //this.gameObject.sendToClients<{}>('', {});

    this.gameObject.sendToClients<{ AbilityFreeze: boolean }>('AbilityFreeze', {
      AbilityFreeze: true,
    });
  }

  ultSubZero(): void {
    this.gameObject.player1.freeze = true;
    this.gameObject.sendToClients<{ SubZeroSpecial: boolean }>(
      'SubZeroSpecial',
      {
        SubZeroSpecial: true,
      },
    );
  }

  abLightning(): void {
    this.gameObject.lightning = true;
    this.gameObject.sendToClients<{ RaidenSpecial: boolean }>('RaidenSpecial', {
      RaidenSpecial: true,
    });
  }

  abMirage(): void {
    this.gameObject.mirage = true;
    this.gameObject.sendToClients<{ AbilityMirage: boolean }>('AbilityMirage', {
      AbilityMirage: true,
    });
  }

  SoundGrenade(): void {
    // this.gameObject.clients.get(client.id);
    this.gameObject.sendToPlayer2('SoundGrenade', {});
    // TODO figure out how to send it to one client
    // this.gameObject.sendToClients<{}>('SoundGrenade', {});
  }

  BallSize(): void {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.ballSize >= 60) return;
    this.gameObject.ballSize *= 2;
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSize,
    });
    setTimeout(() => {
      if (this.gameObject.ballSize >= 15) this.gameObject.ballSize /= 2;
      if (this.gameObject.ballSize < 15 && !this.shrinkTimer)
        this.gameObject.ballSize = 15;
      this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
        ballSize: this.gameObject.ballSize,
      });
    }, 10000);
  }

  ballReset(): void {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.ballSize <= 6) return;
    if (this.shrinkTimer) clearTimeout(this.shrinkTimer);
    this.gameObject.ballSize /= 2;
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSize,
    });
    this.shrinkTimer = setTimeout(() => {
      if (this.gameObject.ballSize < 15) this.gameObject.ballSize = 15;
      this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
        ballSize: this.gameObject.ballSize,
      });
      this.shrinkTimer = null;
    }, 10000);
  }

  randomAbility(): void {
    if (this.gameObject.player1.hasAbility) {
      console.log('Random ability');
      if (this.gameObject.player1.ability === 0) {
        this.ballReset();
      } else if (this.gameObject.player1.ability === 1) {
        this.abFreeze();
      } else if (this.gameObject.player1.ability === 2) {
        this.SoundGrenade();
      } else if (this.gameObject.player1.ability === 3) {
        this.BallSize();
      } else if (this.gameObject.player1.ability === 4) {
        this.abMirage();
      }
      this.setAbility(this.gameObject.player1);
    }
  }

  specialAbility(): void {
    if (this.gameObject.player1.hasSpecial) {
      console.log('Special ability');
      // if (this.gameObject.gameOptions.character === 'Scorpion')
      //   this.ultScorpion();
      // else if (this.gameObject.gameOptions.character === 'SubZero')
      //   this.ultSubZero();
      // else if (this.gameObject.gameOptions.character === 'Raiden')
      //   this.abLightning();
      this.setSpecial(this.gameObject.player1);
    }
  }

  private moveBot(): void {
    if (this.gameObject.gameStarted == false || this.freezeBot) return;

    if (
      this.gameObject.ballPos.y >
      this.gameObject.player2.pos.y + this.gameObject.player2.height / 2
    )
      this.gameObject.player2.pos.y += this.gameObject.player2.speed;
    if (
      this.gameObject.ballPos.y <
      this.gameObject.player2.pos.y + this.gameObject.player2.height / 2
    )
      this.gameObject.player2.pos.y -= this.gameObject.player2.speed;

    if (this.gameObject.player2.pos.y < 0) this.gameObject.player2.pos.y = 0;
    if (
      this.gameObject.player2.pos.y >
      this.gameObject.Height - this.gameObject.player2.height
    )
      this.gameObject.player2.pos.y =
        this.gameObject.Height - this.gameObject.player2.height;

    this.gameObject.sendToClients<{ player2: number }>('player2Update', {
      player2: this.gameObject.player2.pos.y,
    });
  }

  private revertBallSpeed(ballVelX: number, ballVelY: number): void {
    this.gameObject.ballVel.x = ballVelX;
    this.gameObject.ballVel.y = ballVelY;
  }

  private ball_line_interaction(
    line_x: number,
    line_y: { max: number; min: number },
  ): boolean {
    const y_pos =
      this.gameObject.ballPos.y +
      Math.sqrt(
        this.gameObject.ballSize ** 2 -
          (line_x - this.gameObject.ballPos.x) ** 2,
      );
    const y_neg =
      this.gameObject.ballPos.y -
      Math.sqrt(
        this.gameObject.ballSize ** 2 -
          (line_x - this.gameObject.ballPos.x) ** 2,
      );
    if (y_pos < line_y.max && y_pos > line_y.min) return true;
    if (y_neg < line_y.max && y_neg > line_y.min) return true;
    return false;
  }

  private abilityFreeze() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.freeze == true) {
      if (this.szTimer) {
        clearTimeout(this.szTimer);
      } else {
        this.gameObject.ballVelOld.x = this.gameObject.ballVel.x;
        this.gameObject.ballVelOld.y = this.gameObject.ballVel.y;
        this.gameObject.ballVel.x = 0;
        this.gameObject.ballVel.y = 0;
      }
      this.gameObject.freeze = false;
      this.szTimer = setTimeout(() => {
        this.gameObject.ballVel.x = this.gameObject.ballVelOld.x;
        this.gameObject.ballVel.y = this.gameObject.ballVelOld.y;
        this.gameObject.sendToClients<{ AbilityFreeze: boolean }>(
          'AbilityFreeze',
          {
            AbilityFreeze: false,
          },
        );
        this.szTimer = null;
      }, 1200);
    }
  }

  private abilityScorpion() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.player1.getOverHere == true) {
      const speed = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      const target = {
        x: this.gameObject.player1.pos.x + this.gameObject.player1.width,
        y: this.gameObject.player1.pos.y + this.gameObject.player1.height / 2,
      };
      const targetVector = {
        x: target.x - this.gameObject.ballPos.x,
        y: target.y - this.gameObject.ballPos.y,
      };
      const magnitude = Math.sqrt(targetVector.x ** 2 + targetVector.y ** 2);
      targetVector.x = (targetVector.x / magnitude) * speed;
      targetVector.y = (targetVector.y / magnitude) * speed;
      this.gameObject.ballVel = targetVector;
    }
  }

  private abilityMirage() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.mirage) {
      this.gameObject.mirage = false;
      if (this.mirageTimer) {
        clearTimeout(this.mirageTimer);
      }
      let index = 0;
      while (index < 8) {
        this.gameObject.mirageBallsPos.push([
          this.gameObject.ballPos.x + (Math.random() - 0.5) * 10,
          this.gameObject.ballPos.y + (Math.random() - 0.5) * 10,
        ]);
        this.gameObject.mirageBallsVel.push([
          this.gameObject.ballVel.x + (Math.random() - 0.5) * 2,
          this.gameObject.ballVel.y + (Math.random() - 0.5) * 2,
        ]);
        index++;
      }
      this.mirageTimer = setTimeout(() => {
        this.gameObject.sendToClients<{ AbilityMirage: boolean }>(
          'AbilityMirage',
          {
            AbilityMirage: false,
          },
        );
        this.mirageTimer = null;
        this.gameObject.mirageBallsPos = [];
        this.gameObject.mirageBallsVel = [];
      }, 5000);
    }
  }

  private abilityLightning() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.lightning) {
      if (this.gameObject.lightningDir === 0) {
        if (this.gameObject.ballVel.x < 0) {
          this.gameObject.lightningDir = -1;
        } else {
          this.gameObject.lightningDir = 1;
        }
        this.gameObject.ballVel.y =
          (Math.abs(this.gameObject.ballVel.y) +
            Math.abs(this.gameObject.ballVel.x)) *
          2;
        this.gameObject.ballVel.x = 0;
        if (this.gameObject.ballPos.y > 300) {
          this.gameObject.ballVel.y = -this.gameObject.ballVel.y;
          this.gameObject.ballPosTarget = this.gameObject.ballPos.y - 250;
        } else {
          this.gameObject.ballPosTarget = this.gameObject.ballPos.y + 250;
        }
      }
      if (
        (this.gameObject.ballVel.y >= 0 &&
          this.gameObject.ballPos.y >= this.gameObject.ballPosTarget) ||
        (this.gameObject.ballVel.y < 0 &&
          this.gameObject.ballPos.y <= this.gameObject.ballPosTarget)
      ) {
        this.gameObject.lightning = false;
        const hypotenuse = 5;
        this.gameObject.ballVel.y = -this.gameObject.ballVel.y / 4;
        if (this.gameObject.lightningDir < 0) {
          this.gameObject.ballVel.x = -Math.sqrt(
            hypotenuse ** 2 - this.gameObject.ballVel.y ** 2,
          );
        } else
          this.gameObject.ballVel.x = Math.sqrt(
            hypotenuse ** 2 + this.gameObject.ballVel.y ** 2,
          );
        setTimeout(() => {
          this.gameObject.sendToClients<{ RaidenSpecial: boolean }>(
            'RaidenSpecial',
            {
              RaidenSpecial: false,
            },
          );
          const lengthNew = Math.sqrt(
            this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
          );
          const scaleFactor = 5 / lengthNew;
          this.gameObject.ballVel.x *= scaleFactor;
          this.gameObject.ballVel.y *= scaleFactor;
        }, 800);
        this.gameObject.lightningDir = 0;
      }
    }
  }

  private moveBall(): void {
    //return;
    if (this.gameObject.gameStarted == false) return;

    // // Time Warp
    // if (this.gameObject.timeWarp == true) {
    //   if (this.timeWarpTimer) {
    //     clearTimeout(this.szTimer);
    //     this.szTimer = null;
    //   } else {
    //     this.gameObject.ballVel.x = -this.gameObject.ballVel.x;
    //     this.gameObject.ballVel.y = -this.gameObject.ballVel.y;
    //   }
    //   this.gameObject.timeWarp = false;
    //   this.timeWarpTimer = setTimeout(() => {
    //     this.gameObject.ballVel.x = -this.gameObject.ballVel.x;
    //     this.gameObject.ballVel.y = -this.gameObject.ballVel.y;
    //     this.timeWarpTimer = null;
    //   }, 3000);
    // }

    if (!this.gameObject.player1.freeze) {
      if (this.pressUp == 1) {
        this.gameObject.player1.pos.y -= this.gameObject.player1.speed;
        if (this.gameObject.player1.pos.y < 0)
          this.gameObject.player1.pos.y = 0;
      }
      if (this.pressDown == 1) {
        this.gameObject.player1.pos.y += this.gameObject.player1.speed;
        if (
          this.gameObject.player1.pos.y >
          this.gameObject.Height - this.gameObject.player1.height
        )
          this.gameObject.player1.pos.y =
            this.gameObject.Height - this.gameObject.player1.height;
      }
    } else {
      if (!this.freezeTimer) {
        this.freezeTimer = setTimeout(() => {
          this.gameObject.player1.freeze = false;
          this.freezeTimer = null;
          this.gameObject.sendToClients<{ SubZeroSpecial: boolean }>(
            'SubZeroSpecial',
            {
              SubZeroSpecial: false,
            },
          );
        }, 1200);
      }
    }
    this.abilityFreeze();
    this.abilityScorpion();
    this.abilityLightning();
    // Ball movement implementation
    this.gameObject.ballPos.x += this.gameObject.ballVel.x;
    this.gameObject.ballPos.y += this.gameObject.ballVel.y;
    this.abilityMirage();
    // Ball interaction with walls

    if (
      this.gameObject.ballPos.x >= this.gameObject.Width ||
      this.gameObject.ballPos.x <= 0
    ) {
      if (this.gameObject.ballPos.x >= this.gameObject.Width)
        this.gameObject.score.p1 += 1;
      if (this.gameObject.ballPos.x <= 0) this.gameObject.score.p2 += 1;
      if (this.gameObject.score.p1 == 11 || this.gameObject.score.p2 == 11)
        this.stopGame();
      this.gameObject.ballPos.x = this.gameObject.Width / 2;
      this.gameObject.ballPos.y = this.gameObject.Height / 2;
      this.gameObject.ballVel.y = -0.5;
      this.gameObject.ballVel.x = 5;
    }

    if (
      (this.gameObject.ballPos.y + this.gameObject.ballSize >=
        this.gameObject.Height &&
        this.gameObject.ballVel.y > 0) ||
      (this.gameObject.ballPos.y - this.gameObject.ballSize <= 0 &&
        this.gameObject.ballVel.y < 0)
    ) {
      this.gameObject.ballVel.y = this.gameObject.ballVel.y * -1;
    }

    // Ball interaction with player 1
    if (
      this.gameObject.ballVel.x <= 0 &&
      this.ball_line_interaction(
        this.gameObject.player1.pos.x + this.gameObject.player1.width,
        {
          max: this.gameObject.player1.pos.y + this.gameObject.player1.height,
          min: this.gameObject.player1.pos.y,
        },
      )
    ) {
      const lengthOld = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      const maxChange = 0.5;
      let change =
        this.gameObject.ballPos.y -
        (this.gameObject.player1.pos.y + this.gameObject.player1.height / 2);
      if (Math.abs(change) > maxChange) {
        if (change > 0) change = maxChange;
        else change = maxChange * -1;
      }
      this.gameObject.ballVel.x = this.gameObject.ballVel.x * -1;
      this.gameObject.ballVel.y += change;
      this.gameObject.player1.getOverHere = false;
      this.gameObject.freeze = false;
      const lengthNew = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      const scaleFactor = lengthOld / lengthNew;
      // if (this.gameObject.gameOptions.gameMode === 'Regular Pong')
      //   scaleFactor *= 1.02;
      this.gameObject.ballVel.x *= scaleFactor * 1.01;
      this.gameObject.ballVel.y *= scaleFactor * 1.01;
    }

    // Ball interaction with player 2
    if (
      this.gameObject.ballVel.x >= 0 &&
      this.ball_line_interaction(this.gameObject.player2.pos.x, {
        max: this.gameObject.player2.pos.y + this.gameObject.player2.height,
        min: this.gameObject.player2.pos.y,
      })
    ) {
      const lengthOld = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      const maxChange = 0.5;
      let change =
        this.gameObject.ballPos.y -
        (this.gameObject.player2.pos.y + this.gameObject.player2.height / 2);
      if (Math.abs(change) > maxChange) {
        if (change > 0) change = maxChange;
        else change = maxChange * -1;
      }
      this.gameObject.ballVel.x = this.gameObject.ballVel.x * -1;
      this.gameObject.ballVel.y += change;
      const lengthNew = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      const scaleFactor = lengthOld / lengthNew;
      // if (this.gameObject.gameOptions.gameMode === 'Regular Pong')
      //   scaleFactor *= 1.02;
      this.gameObject.ballVel.x *= scaleFactor;
      this.gameObject.ballVel.y *= scaleFactor;
    }

    if (this.mirageTimer) {
      let i: string;
      for (i in this.gameObject.mirageBallsPos) {
        this.gameObject.mirageBallsPos[i][0] +=
          this.gameObject.mirageBallsVel[i][0];
        this.gameObject.mirageBallsPos[i][1] +=
          this.gameObject.mirageBallsVel[i][1];
        if (
          this.gameObject.mirageBallsPos[i][1] + this.gameObject.ballSize >=
            this.gameObject.Height ||
          this.gameObject.mirageBallsPos[i][1] - this.gameObject.ballSize <= 0
        ) {
          this.gameObject.mirageBallsVel[i][1] =
            this.gameObject.mirageBallsVel[i][1] * -1;
        }
        if (
          this.gameObject.mirageBallsPos[i][0] + this.gameObject.ballSize >=
            this.gameObject.Width ||
          this.gameObject.mirageBallsPos[i][0] - this.gameObject.ballSize <= 0
        ) {
          this.gameObject.mirageBallsVel[i][0] =
            this.gameObject.mirageBallsVel[i][0] * -1;
        }
      }
      this.gameObject.sendToClients<{ mirageUpdate: number[][] }>(
        'mirageUpdate',
        {
          mirageUpdate: this.gameObject.mirageBallsPos,
        },
      );
    }
    this.gameObject.sendToClients<{ player1: number }>('player1Update', {
      player1: this.gameObject.player1.pos.y,
    });
    this.gameObject.sendToClients<{ ball: { x: number; y: number } }>(
      'ballUpdate',
      {
        ball: this.gameObject.ballPos,
      },
    );
    this.gameObject.sendToClients<{ score: { p1: number; p2: number } }>(
      'scoreUpdate',
      {
        score: this.gameObject.score,
      },
    );
    this.gameObject.sendToClients<{ ScorpionSpecial: boolean }>(
      'ScorpionSpecial',
      {
        ScorpionSpecial: this.gameObject.player1.getOverHere,
      },
    );
  }
}
