import { Player } from './dto/player.dto';
import { GameObject } from './gameObject';
import { Character } from './enums/Characters';
import { Mode } from './enums/Modes';
import { Inject, forwardRef } from '@nestjs/common';
// import { GameGateway } from './game.gateway';
import { ChatGateway } from 'src/chat/chat.gateway';

// @Injectable()
export class GameService {
  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  private freezeTimer: NodeJS.Timeout | null = null;
  private mirageTimer: NodeJS.Timeout | null = null;
  private shrinkTimer: NodeJS.Timeout | null = null;
  private lightningSlowTimer: NodeJS.Timeout | null = null;
  private lightningTimer: NodeJS.Timeout | null = null;
  private ventailTimer: NodeJS.Timeout | null = null;

  private readyToServe = true;
  private scored = false;

  constructor(
    private readonly gameObject: GameObject,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {
    console.log('new gameservice class created');
  }

  async getUsernames() {
    this.gameObject.player1.user = await this.chatGateway.getUserName(
      this.gameObject.player1.databaseId,
    );
    if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer)
      this.gameObject.player2.user = await this.chatGateway.getUserName(
        this.gameObject.player2.databaseId,
      );
  }

  initGame(): void {
    if (this.gameObject.gameStarted) return;
    this.gameObject.gameStarted = true;
    (async () => {
      console.log('before await');
      await this.getUsernames();
      let finalName2: string;
      const finalName1 = this.gameObject.player1.user.username;
      if (this.gameObject.player2.user)
        finalName2 = this.gameObject.player2.user.username;
      else finalName2 = 'Bot';
      this.gameObject.sendToClients<{
        player1Username: string;
        player2Username: string;
      }>('playerUsernames', {
        player1Username: finalName1,
        player2Username: finalName2,
      });
    })();
    console.log('GAME SERVICE => player1 = ', this.gameObject.player1.user);
    console.log('GAME SERVICE => player2 = ', this.gameObject.player2.user);
    this.gameObject.sendToPlayer1<{
      player: number;
      ability: number;
    }>('gameInit', {
      player: 1,
      ability: this.gameObject.player1.ability,
    });
    this.gameObject.sendToPlayer2<{
      player: number;
      ability: number;
    }>('gameInit', {
      player: 2,
      ability: this.gameObject.player2.ability,
    });
    this.gameObject.sendToClients<{
      mode: number;
      hyper: boolean;
      dodge: boolean;
      player1Character: number;
      player1Size: number;
      player1X: number;
      player1Y: number;
      player2Character: number;
      player2Size: number;
      player2X: number;
      player2Y: number;
    }>('gameOptions', {
      mode: this.gameObject.player1.options.gameMode,
      hyper: this.gameObject.player1.options.hyper,
      dodge: this.gameObject.player1.options.dodge,
      player1Character: this.gameObject.player1.options.character,
      player1Size: this.gameObject.player1.options.paddle,
      player1X: this.gameObject.player1.pos.x,
      player1Y: this.gameObject.player1.pos.y,
      player2Character: this.gameObject.player2.options.character,
      player2Size: this.gameObject.player2.options.paddle,
      player2X: this.gameObject.player2.pos.x,
      player2Y: this.gameObject.player2.pos.y,
    });
  }

  startGame(): void {
    this.chatGateway.addGameID(
      this.gameObject.player1.databaseId,
      this.gameObject.gameID,
    );
    this.chatGateway.addGameID(
      this.gameObject.player2.databaseId,
      this.gameObject.gameID,
    );
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSizeDefault,
    });
    this.serve();
    console.log('Setting ball timer...');
    this.ballTimer = setInterval(() => {
      this.moveBall();
    }, 10);
    console.log('Setting bot timer...');
    if (this.gameObject.gameOptions.gameMode === Mode.Singleplayer) {
      this.botTimer = setInterval(() => {
        this.moveBot();
      }, 100);
    }
  }

  stopGame(leftID = ''): void {
    if (this.gameObject.gameEnded === true) return;
    if (!this.gameObject.player2) {
      console.log('Disconnected from queue -> removes game');
      console.log('TODO handle leave queue if the user doesnt disconnect');
      this.chatGateway.removeGame(this.gameObject.gameID);
      return;
    }
    if (this.gameObject.player1.databaseId)
      this.chatGateway.removeGameID(this.gameObject.player1.databaseId);
    if (this.gameObject.player2.databaseId)
      this.chatGateway.removeGameID(this.gameObject.player2.databaseId);
    this.gameObject.gameEnded = true;
    if (this.ballTimer) {
      clearInterval(this.ballTimer);
      this.ballTimer = null;
    }

    // Stops calling the moveBot function
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
    if (!this.gameObject.player2) return;
    let result: number;
    let winningPlayer: number;
    let winningPlayerId: string;
    if (this.gameObject.score.p1 === 11) {
      result = 0;
      winningPlayer = 1;
      if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer)
        winningPlayerId = this.gameObject.player1.databaseId;
    } else if (this.gameObject.score.p2 === 11) {
      result = 0;
      winningPlayer = 2;
      if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer)
        winningPlayerId = this.gameObject.player2.databaseId;
    } else {
      result = 1;
      if (leftID === this.gameObject.player2.id) {
        winningPlayer = 1;
        if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer)
          winningPlayerId = this.gameObject.player1.databaseId;
      } else {
        winningPlayer = 2;
        if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer)
          winningPlayerId = this.gameObject.player2.databaseId;
      }
    }
    this.gameObject.sendToClients<{ winner: number; result: number }>(
      'winnerUpdate',
      {
        winner: winningPlayer,
        result: result,
      },
    );
    if (this.gameObject.gameOptions.gameMode !== Mode.Singleplayer) {
      let gameMode: string;
      let gameModeOptions: string;
      if (this.gameObject.gameOptions.gameMode === Mode.MasterOfPong)
        gameMode = 'Master Of Pong';
      else if (this.gameObject.gameOptions.gameMode === Mode.Regular)
        gameMode = 'Regular Pong';
      if (
        this.gameObject.gameOptions.dodge &&
        this.gameObject.gameOptions.hyper
      )
        gameModeOptions = 'Hyper DodgeBall';
      else if (this.gameObject.gameOptions.dodge) gameModeOptions = 'DodgeBall';
      else if (this.gameObject.gameOptions.hyper) gameModeOptions = 'Hyper';
      else gameModeOptions = 'Default';
      this.chatGateway.addGameData(
        this.gameObject.player1.databaseId,
        this.gameObject.player2.databaseId,
        winningPlayerId,
        this.gameObject.createdAt,
        this.gameObject.score.p1,
        this.gameObject.score.p2,
        gameMode,
        gameModeOptions,
      );
    }

    this.gameObject.default();
    this.gameObject.sendToClients<{ gameStatus: boolean }>('gameStatus', {
      gameStatus: this.gameObject.gameStarted,
    });
    this.chatGateway.removeGame(this.gameObject.gameID);
  }

  ultVenomtail(player: Player, opponent: Player): void {
    if (this.gameObject.gameOptions.dodge) {
      player.getOverHere = false;
      opponent.getOverHere = true;
      if (this.ventailTimer) clearTimeout(this.ventailTimer);
      this.ventailTimer = setTimeout(() => {
        opponent.getOverHere = false;
        this.ventailTimer = null;
      }, 3000);
    } else {
      player.getOverHere = true;
      opponent.getOverHere = false;
      this.gameObject.sendToClients<{
        VenomtailSpecial: boolean;
        target: number;
      }>('VenomtailSpecial', {
        VenomtailSpecial: true,
        target: player.player,
      });
      if (this.ventailTimer) clearTimeout(this.ventailTimer);
      this.ventailTimer = setTimeout(() => {
        player.getOverHere = false;
        this.gameObject.sendToClients<{
          VenomtailSpecial: boolean;
        }>('VenomtailSpecial', {
          VenomtailSpecial: false,
        });
        this.ventailTimer = null;
      }, 1000);
    }
  }

  abTimeWarp(): void {
    this.gameObject.timeWarp = true;
  }

  abFreeze(): void {
    this.gameObject.freeze = true;
    this.gameObject.sendToClients<{ AbilityFreeze: boolean }>('AbilityFreeze', {
      AbilityFreeze: true,
    });
  }

  ultBelowZero(opponent: Player): void {
    opponent.freeze = true;
    this.gameObject.sendToClients<{ target: number }>('BelowZeroSpecial', {
      target: opponent.player,
    });
    opponent.freezeTimer = setTimeout(() => {
      opponent.freeze = false;
      opponent.freezeTimer = null;
      this.gameObject.sendToClients<{
        target: number;
      }>('BelowZeroSpecial', {
        target: -opponent.player,
      });
    }, 1200);
  }

  abLightning(): void {
    if (this.freezeTimer) {
      clearTimeout(this.freezeTimer);
      this.freezeTimer = null;
      this.gameObject.ballVel.x = this.gameObject.ballVelOld.x;
      this.gameObject.ballVel.y = this.gameObject.ballVelOld.y;
      this.gameObject.sendToClients<{ AbilityFreeze: boolean }>(
        'AbilityFreeze',
        {
          AbilityFreeze: false,
        },
      );
    }
    this.revertLightningSlow();
    this.revertLightning(false);
    this.gameObject.ballMagnitude = Math.sqrt(
      this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
    );
    this.gameObject.sendToClients<{ RaivenSpecial: boolean }>('RaivenSpecial', {
      RaivenSpecial: true,
    });
    this.gameObject.ballVel.x /= 4;
    this.gameObject.ballVel.y /= 4;
    this.lightningSlowTimer = setTimeout(() => {
      this.gameObject.ballVel.x *= 4;
      this.gameObject.ballVel.y *= 4;
      this.gameObject.lightning = true;
      this.lightningSlowTimer = null;
    }, 500);
  }

  revertLightningSlow(): void {
    if (this.lightningSlowTimer) {
      clearTimeout(this.lightningSlowTimer);
      this.gameObject.ballVel.x *= 4;
      this.gameObject.ballVel.y *= 4;
      this.lightningSlowTimer = null;
    }
  }

  revertLightning(contact: boolean): void {
    if (this.lightningTimer) {
      clearTimeout(this.lightningTimer);
      this.lightningTimer = null;
      if (contact) {
        this.gameObject.sendToClients<{ RaivenSpecial: boolean }>(
          'RaivenSpecial',
          {
            RaivenSpecial: false,
          },
        );
      }
      this.gameObject.ballVel.x =
        this.gameObject.ballVel.x *
        (this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2));
      this.gameObject.ballVel.y =
        this.gameObject.ballVel.y *
        (this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2));
    } else if (this.gameObject.lightning) {
      this.gameObject.ballVel.y = -this.gameObject.ballVel.y / 4;
      if (this.gameObject.lightningDir < 0) {
        this.gameObject.ballVel.x = -Math.sqrt(
          this.gameObject.ballMagnitude ** 2 - this.gameObject.ballVel.y ** 2,
        );
      }
    }
  }

  abMirage(): void {
    this.gameObject.mirage = true;
    this.gameObject.sendToClients<{ AbilityMirage: boolean }>('AbilityMirage', {
      AbilityMirage: true,
    });
    if (this.mirageTimer) {
      clearTimeout(this.mirageTimer);
    }
    let index = 0;
    while (index < this.gameObject.mirageNumber) {
      this.gameObject.mirageBallsPos.push([
        this.gameObject.ballPos.x +
          (Math.random() - 0.5) * this.gameObject.mirageSpread,
        this.gameObject.ballPos.y +
          (Math.random() - 0.5) * this.gameObject.mirageSpread,
      ]);
      this.gameObject.mirageBallsVel.push([
        this.gameObject.ballVel.x + (Math.random() - 0.5) * 2,
        this.gameObject.ballVel.y + (Math.random() - 0.5) * 2,
      ]);
      index++;
    }
    if (!this.gameObject.gameOptions.dodge) {
      this.mirageTimer = setTimeout(() => {
        this.gameObject.sendToClients<{ AbilityMirage: boolean }>(
          'AbilityMirage',
          {
            AbilityMirage: false,
          },
        );
        this.gameObject.mirage = false;
        this.mirageTimer = null;
        this.gameObject.mirageBallsPos = [];
        this.gameObject.mirageBallsVel = [];
      }, 5000);
    }
  }

  BallSize(): void {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.ballSize >= 120) return;
    this.gameObject.ballSize *= 4;
    this.gameObject.twoThirdsBallRadius = this.gameObject.ballSize * (2 / 3);
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSize,
    });
    setTimeout(() => {
      if (this.gameObject.ballSize >= this.gameObject.ballSizeDefault)
        this.gameObject.ballSize /= 4;
      if (
        this.gameObject.ballSize < this.gameObject.ballSizeDefault &&
        !this.shrinkTimer
      )
        this.gameObject.ballSize = this.gameObject.ballSizeDefault;
      this.gameObject.twoThirdsBallRadius = this.gameObject.ballSize * (2 / 3);
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
    this.gameObject.twoThirdsBallRadius = this.gameObject.ballSize * (2 / 3);
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSize,
    });
    this.shrinkTimer = setTimeout(() => {
      if (this.gameObject.ballSize < 15) {
        this.gameObject.ballSize = 15;
        this.gameObject.twoThirdsBallRadius =
          this.gameObject.ballSize * (2 / 3);
      }
      this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
        ballSize: this.gameObject.ballSize,
      });
      this.shrinkTimer = null;
    }, 10000);
  }

  randomAbility(player: Player, opponent: Player): void {
    if (player.hasAbility) {
      console.log('Random ability');
      switch (player.ability) {
        case 0:
          this.ballReset();
          break;
        case 1:
          this.abFreeze();
          break;
        case 2:
          opponent.SoundGrenade();
          break;
        case 3:
          this.BallSize();
          break;
        case 4:
          this.abMirage();
          break;
        case 5:
          if (this.gameObject.gameOptions.dodge) {
            this.ultVenomtail(player, opponent);
          } else {
            this.abDeflect(player);
          }
          break;
      }
      player.setAbility();
    }
  }

  specialAbility(player: Player, opponent: Player): void {
    if (player.hasSpecial) {
      console.log('Special ability');
      if (
        player.options.character === Character.Raiven ||
        this.gameObject.gameOptions.dodge
      ) {
        this.abLightning();
      } else if (player.options.character === Character.Venomtail)
        this.ultVenomtail(player, opponent);
      else if (player.options.character === Character.BelowZero)
        this.ultBelowZero(opponent);
      player.setSpecial();
    }
  }

  private moveBot(): void {
    if (this.gameObject.gameStarted == false) return;
    if (this.gameObject.player2.hasAbility) {
      switch (this.gameObject.player2.ability) {
        case 0:
          if (
            this.gameObject.ballVel.x < 0 &&
            this.gameObject.ballPos.x < 200
          ) {
            this.ballReset();
            this.gameObject.player2.setAbility();
          }
          break;
        case 1:
          if (
            this.gameObject.ballVel.x > 0 &&
            this.gameObject.ballPos.x > 1140 &&
            this.gameObject.ballPos.x < 1180 &&
            Math.abs(
              this.gameObject.ballPos.y -
                (this.gameObject.player2.pos.y +
                  this.gameObject.player2.height / 2),
            ) > 60
          ) {
            this.abFreeze();
            this.gameObject.player2.setAbility();
          }
          break;
        case 2:
          this.gameObject.player2.setAbility();
          break;
        case 3:
          if (this.gameObject.ballVel.x > 0) {
            this.BallSize();
            this.gameObject.player2.setAbility();
          }
          break;
        case 4:
          if (this.gameObject.ballVel.x < 0) {
            this.abMirage();
            this.gameObject.player2.setAbility();
          }
          break;
        case 5:
          if (this.gameObject.gameOptions.dodge) {
            this.ultVenomtail(this.gameObject.player2, this.gameObject.player1);
            this.gameObject.player2.setAbility();
          } else {
            if (
              this.gameObject.ballVel.x > 0 &&
              this.gameObject.ballPos.x < 200 &&
              this.gameObject.ballPos.x > 100
            ) {
              this.abDeflect(this.gameObject.player2);
              this.gameObject.player2.setAbility();
            }
          }
          break;
      }
    }
    if (
      this.gameObject.player2.hasSpecial &&
      !this.gameObject.gameOptions.dodge
    ) {
      switch (this.gameObject.player2.options.character) {
        case Character.BelowZero:
          if (
            this.gameObject.ballVel.x < 0 &&
            this.gameObject.ballPos.x < 500
          ) {
            this.ultBelowZero(this.gameObject.player1);
            this.gameObject.player2.setSpecial();
          }
          break;
        case Character.Venomtail:
          if (
            this.gameObject.ballVel.x > 0 &&
            this.gameObject.ballPos.x > 950 &&
            this.gameObject.ballPos.x < 1150 &&
            Math.abs(
              this.gameObject.ballPos.y -
                (this.gameObject.player2.pos.y +
                  this.gameObject.player2.height / 2),
            ) > 100
          ) {
            this.ultVenomtail(this.gameObject.player2, this.gameObject.player1);
            this.gameObject.player2.setSpecial();
          }
          break;
        case Character.Raiven:
          if (
            this.gameObject.ballVel.x < 0 &&
            this.gameObject.ballPos.x < 100 &&
            Math.abs(
              this.gameObject.ballPos.y -
                (this.gameObject.player1.pos.y +
                  this.gameObject.player1.height / 2),
            ) < 50
          ) {
            this.abLightning();
            this.gameObject.player2.setSpecial();
          }
          break;
      }
    }
    if (this.gameObject.player2.freeze) return;
    if (this.gameObject.gameOptions.dodge) {
      if (this.gameObject.ballVel.x < 0 || this.gameObject.ballPos.x < 600) {
        this.gameObject.player2.moveUp = false;
        this.gameObject.player2.moveDown = false;
      } else if (
        this.gameObject.ballPos.y <
          this.gameObject.player2.pos.y + this.gameObject.player2.height &&
        this.gameObject.ballPos.y > this.gameObject.player2.pos.y
      ) {
        if (this.gameObject.player2.moveUp || this.gameObject.player2.moveDown)
          return;
        else if (Math.random() >= 0.5) this.gameObject.player2.moveUp = true;
        else this.gameObject.player2.moveDown = true;
      } else {
        this.gameObject.player2.moveUp = false;
        this.gameObject.player2.moveDown = false;
      }
    } else {
      if (this.gameObject.ballVel.x < 0 || this.gameObject.ballPos.x < 600) {
        this.gameObject.player2.moveUp = false;
        this.gameObject.player2.moveDown = false;
      } else if (
        this.gameObject.ballPos.y >
        this.gameObject.player2.pos.y + this.gameObject.player2.height
      ) {
        this.gameObject.player2.moveUp = false;
        this.gameObject.player2.moveDown = true;
      } else if (this.gameObject.ballPos.y < this.gameObject.player2.pos.y) {
        this.gameObject.player2.moveDown = false;
        this.gameObject.player2.moveUp = true;
      } else {
        this.gameObject.player2.moveUp = false;
        this.gameObject.player2.moveDown = false;
      }
    }
  }

  private movePlayer(player: Player) {
    if (!player.freeze && !player.deflect) {
      if (player.moveUp) {
        player.pos.y -= player.speed;
        if (player.pos.y < 0) player.pos.y = 0;
      } else if (player.moveDown) {
        player.pos.y += player.speed;
        if (player.pos.y > this.gameObject.Height - player.height)
          player.pos.y = this.gameObject.Height - player.height;
      }
      if (this.gameObject.gameOptions.dodge) {
        if (player.moveLeft) {
          player.pos.x -= player.speed;
          if (player.pos.x < 0) player.pos.x = 0;
        } else if (player.moveRight) {
          player.pos.x += player.speed;
          if (player.pos.x > this.gameObject.Width - player.width)
            player.pos.x = this.gameObject.Width - player.width;
        }
      }
    }
  }

  private ball_line_intersection(
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
    if (y_pos <= line_y.max && y_pos >= line_y.min) return true;
    if (y_neg <= line_y.max && y_neg >= line_y.min) return true;
    if (y_pos > line_y.max && y_neg < line_y.min) return true;
    return false;
  }

  private abDeflect(player: Player) {
    player.deflect = true;
    if (player.player === 1) {
      player.pos.x = this.gameObject.ballPos.x - this.gameObject.ballSize;
    } else {
      player.pos.x = this.gameObject.ballPos.x + this.gameObject.ballSize;
    }
    player.posYOld = player.pos.y;
    player.pos.y = this.gameObject.ballPos.y - player.height / 2;
    setTimeout(() => {
      player.deflect = false;
      player.pos.y = player.posYOld;
      player.pos.x = player.player === 1 ? 20 : 1170;
      this.gameObject.sendToClients<{ player1X: number; player2X: number }>(
        'positionXUpdate',
        {
          player1X: this.gameObject.player1.pos.x,
          player2X: this.gameObject.player2.pos.x,
        },
      );
    }, 300);
  }

  private abilityFreeze() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.freeze == true) {
      if (this.freezeTimer) {
        clearTimeout(this.freezeTimer);
      } else {
        this.revertLightningSlow();
        this.revertLightning(true);
        this.gameObject.ballVelOld.x = this.gameObject.ballVel.x;
        this.gameObject.ballVelOld.y = this.gameObject.ballVel.y;
        this.gameObject.ballVel.x = 0;
        this.gameObject.ballVel.y = 0;
      }
      this.gameObject.freeze = false;
      this.freezeTimer = setTimeout(() => {
        this.gameObject.ballVel.x = this.gameObject.ballVelOld.x;
        this.gameObject.ballVel.y = this.gameObject.ballVelOld.y;
        this.gameObject.sendToClients<{ AbilityFreeze: boolean }>(
          'AbilityFreeze',
          {
            AbilityFreeze: false,
          },
        );
        this.freezeTimer = null;
      }, 1200);
    }
  }

  private abilityVenomtail(player: Player) {
    const speed = Math.sqrt(
      this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
    );
    const target = {
      x: player.pos.x + player.width,
      y: player.pos.y + player.height / 2,
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

  private abilityLightning() {
    if (!this.gameObject.allowAbilities) return;
    if (this.gameObject.lightning) {
      if (this.lightningTimer) {
        clearTimeout(this.lightningTimer);
        this.lightningTimer = null;
        this.gameObject.ballVel.x *=
          this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2);
        this.gameObject.ballVel.y *=
          this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2);
      }
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
        this.gameObject.ballVel.y = -this.gameObject.ballVel.y / 4;
        if (this.gameObject.lightningDir < 0) {
          this.gameObject.ballVel.x = -Math.sqrt(
            (this.gameObject.ballMagnitude + 2) ** 2 -
              this.gameObject.ballVel.y ** 2,
          );
        } else
          this.gameObject.ballVel.x = Math.sqrt(
            (this.gameObject.ballMagnitude + 2) ** 2 -
              this.gameObject.ballVel.y ** 2,
          );
        this.lightningTimer = setTimeout(() => {
          this.gameObject.sendToClients<{ RaivenSpecial: boolean }>(
            'RaivenSpecial',
            {
              RaivenSpecial: false,
            },
          );
          this.gameObject.ballVel.x *=
            this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2);
          this.gameObject.ballVel.y *=
            this.gameObject.ballMagnitude / (this.gameObject.ballMagnitude + 2);
          this.lightningTimer = null;
        }, 800);
        this.gameObject.lightningDir = 0;
      }
    }
  }

  private score(player: number): void {
    if (player === 1) {
      this.gameObject.score.p1++;
      if (this.gameObject.score.p1 === 11) this.stopGame();
    } else if (player === 2) {
      this.gameObject.score.p2++;
      if (this.gameObject.score.p2 === 11) this.stopGame();
    }
    this.gameObject.sendToClients<{ newScore: { p1: number; p2: number } }>(
      'scoreUpdate',
      {
        newScore: this.gameObject.score,
      },
    );
  }

  private serve(): void {
    this.gameObject.ballPos.x = this.gameObject.Width / 2;
    this.gameObject.ballPos.y = this.gameObject.Height / 2;
    let angle = Math.random() * 360;
    if (angle > 45 && angle < 135) {
      angle = Math.random() * 45;
    } else if (angle > 225 && angle < 315) {
      angle = Math.random() * 45 + 315;
    }
    angle = angle * (Math.PI / 180);
    this.gameObject.ballVel.x =
      this.gameObject.ballVelDefault.x * Math.cos(angle) -
      this.gameObject.ballVelDefault.y * Math.sin(angle);
    this.gameObject.ballVel.y =
      this.gameObject.ballVelDefault.x * Math.sin(angle) +
      this.gameObject.ballVelDefault.y * Math.cos(angle);
  }

  private resetEffects(): void {
    this.gameObject.player1.freeze = false;
    this.gameObject.player2.freeze = false;
    this.revertLightningSlow();
    this.gameObject.lightning = false;
    this.gameObject.freeze = false;
    this.gameObject.player1.getOverHere = false;
    this.gameObject.player2.getOverHere = false;
    this.gameObject.ballSize = this.gameObject.ballSizeDefault;
    this.gameObject.twoThirdsBallRadius = this.gameObject.ballSize * (2 / 3);
    if (this.gameObject.mirage) {
      this.gameObject.mirage = false;
      clearTimeout(this.mirageTimer);
      this.mirageTimer = null;
      this.gameObject.mirageBallsPos = [];
      this.gameObject.mirageBallsVel = [];
    }
    this.gameObject.sendToClients<{ ballSize: number }>('BallSize', {
      ballSize: this.gameObject.ballSizeDefault,
    });
    if (this.gameObject.player1.freezeTimer) {
      clearTimeout(this.gameObject.player1.freezeTimer);
      this.gameObject.player1.freezeTimer = null;
    }
    if (this.gameObject.player2.freezeTimer) {
      clearTimeout(this.gameObject.player2.freezeTimer);
      this.gameObject.player2.freezeTimer = null;
    }
    if (this.shrinkTimer) {
      clearTimeout(this.shrinkTimer);
      this.shrinkTimer = null;
    }
    if (this.freezeTimer) {
      clearTimeout(this.freezeTimer);
      this.gameObject.sendToClients<{ AbilityFreeze: boolean }>(
        'AbilityFreeze',
        {
          AbilityFreeze: false,
        },
      );
      this.freezeTimer = null;
    }
  }

  private updateMirage(): void {
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

  private ballPlayerInteraction(): void {
    if (this.gameObject.gameOptions.dodge) {
      let scored = 0;
      if (
        this.ball_line_intersection(
          this.gameObject.player1.pos.x + this.gameObject.player1.width,
          {
            max: this.gameObject.player1.pos.y + this.gameObject.player1.height,
            min: this.gameObject.player1.pos.y,
          },
        ) ||
        this.ball_line_intersection(this.gameObject.player1.pos.x, {
          max: this.gameObject.player1.pos.y + this.gameObject.player1.height,
          min: this.gameObject.player1.pos.y,
        })
      ) {
        this.score(2);
        scored++;
      }
      if (
        this.ball_line_intersection(this.gameObject.player2.pos.x, {
          max: this.gameObject.player2.pos.y + this.gameObject.player2.height,
          min: this.gameObject.player2.pos.y,
        }) ||
        this.ball_line_intersection(
          this.gameObject.player2.pos.x + this.gameObject.player2.width,
          {
            max: this.gameObject.player2.pos.y + this.gameObject.player2.height,
            min: this.gameObject.player2.pos.y,
          },
        )
      ) {
        this.score(1);
        scored++;
      }
      if (scored > 0) {
        this.scored = true;
        setTimeout(() => {
          this.resetEffects();
          this.serve();
          this.scored = false;
          this.readyToServe = false;
          this.gameObject.player1.pos.x = 20;
          this.gameObject.player1.pos.y = 350;
          this.gameObject.player2.pos.x = 1170;
          this.gameObject.player2.pos.y = 350;
          setTimeout(() => {
            this.readyToServe = true;
          }, 500);
        }, 500);
      }
      return;
    }
    // Ball interaction with player 1
    if (
      this.gameObject.ballVel.x <= 0 &&
      this.ball_line_intersection(
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
      if (this.gameObject.player1.getOverHere) {
        this.gameObject.player1.getOverHere = false;
        this.gameObject.sendToClients<{
          VenomtailSpecial: boolean;
        }>('VenomtailSpecial', {
          VenomtailSpecial: false,
        });
      }
      this.gameObject.freeze = false;
      const lengthNew = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      let scaleFactor = lengthOld / lengthNew;
      scaleFactor *= 1.02;
      this.gameObject.ballVel.x *= scaleFactor;
      this.gameObject.ballVel.y *= scaleFactor;
    }
    // Ball interaction with player 2
    if (
      this.gameObject.ballVel.x >= 0 &&
      this.ball_line_intersection(this.gameObject.player2.pos.x, {
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
      if (this.gameObject.player2.getOverHere) {
        this.gameObject.player2.getOverHere = false;
        this.gameObject.sendToClients<{
          VenomtailSpecial: boolean;
        }>('VenomtailSpecial', {
          VenomtailSpecial: false,
        });
      }
      const lengthNew = Math.sqrt(
        this.gameObject.ballVel.x ** 2 + this.gameObject.ballVel.y ** 2,
      );
      let scaleFactor = lengthOld / lengthNew;
      scaleFactor *= 1.02;
      this.gameObject.ballVel.x *= scaleFactor;
      this.gameObject.ballVel.y *= scaleFactor;
    }
  }

  private moveBall(): void {
    if (this.gameObject.gameStarted == false) return;
    if (!this.readyToServe) {
      this.gameObject.sendToClients<{
        player1: number;
        player2: number;
        ball: { x: number; y: number };
      }>('positionsUpdate', {
        player1: this.gameObject.player1.pos.y,
        player2: this.gameObject.player2.pos.y,
        ball: this.gameObject.ballPos,
      });
      if (this.gameObject.gameOptions.dodge) {
        this.gameObject.sendToClients<{ player1X: number; player2X: number }>(
          'positionXUpdate',
          {
            player1X: this.gameObject.player1.pos.x,
            player2X: this.gameObject.player2.pos.x,
          },
        );
      }
      return;
    }

    if (this.gameObject.player1.useSpecial === true) {
      this.specialAbility(this.gameObject.player1, this.gameObject.player2);
      this.gameObject.player1.useSpecial = false;
    }
    if (this.gameObject.player2.useSpecial === true) {
      this.specialAbility(this.gameObject.player2, this.gameObject.player1);
      this.gameObject.player2.useSpecial = false;
    }

    if (this.gameObject.player1.useAbility === true) {
      this.randomAbility(this.gameObject.player1, this.gameObject.player2);
      this.gameObject.player1.useAbility = false;
    }
    if (this.gameObject.player2.useAbility === true) {
      this.randomAbility(this.gameObject.player2, this.gameObject.player1);
      this.gameObject.player2.useAbility = false;
    }
    this.movePlayer(this.gameObject.player1);
    this.movePlayer(this.gameObject.player2);
    this.abilityFreeze();
    if (this.gameObject.player1.getOverHere)
      this.abilityVenomtail(this.gameObject.player1);
    if (this.gameObject.player2.getOverHere)
      this.abilityVenomtail(this.gameObject.player2);
    this.abilityLightning();

    // Ball movement implementation
    this.gameObject.ballPos.x += this.gameObject.ballVel.x;
    this.gameObject.ballPos.y += this.gameObject.ballVel.y;

    if (!this.scored) this.ballPlayerInteraction();
    // Ball interaction with walls
    if (this.gameObject.gameOptions.dodge) {
      if (
        (this.gameObject.ballPos.x + this.gameObject.ballSize >=
          this.gameObject.Width &&
          this.gameObject.ballVel.x > 0) ||
        (this.gameObject.ballPos.x - this.gameObject.ballSize <= 0 &&
          this.gameObject.ballVel.x < 0)
      ) {
        this.gameObject.ballVel.x = -this.gameObject.ballVel.x;
        this.gameObject.ballVel.x *= 1.05;
        this.gameObject.ballVel.y *= 1.05;
      }
    } else if (
      this.gameObject.ballPos.x + this.gameObject.twoThirdsBallRadius >=
        this.gameObject.Width &&
      this.gameObject.ballVel.x > 0 &&
      !this.scored
    ) {
      this.score(1);
      this.scored = true;
      setTimeout(() => {
        this.resetEffects();
        this.serve();
        this.scored = false;
        this.readyToServe = false;
        this.gameObject.player1.pos.y = 350;
        this.gameObject.player2.pos.y = 350;
        setTimeout(() => {
          this.readyToServe = true;
        }, 500);
      }, 500);
      return;
    } else if (
      this.gameObject.ballPos.x - this.gameObject.twoThirdsBallRadius <= 0 &&
      this.gameObject.ballVel.x < 0 &&
      !this.scored
    ) {
      this.score(2);
      this.scored = true;
      setTimeout(() => {
        this.resetEffects();
        this.serve();
        this.scored = false;
        this.readyToServe = false;
        this.gameObject.player1.pos.y = 350;
        this.gameObject.player2.pos.y = 350;
        setTimeout(() => {
          this.readyToServe = true;
        }, 500);
      }, 500);
      return;
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

    if (this.gameObject.mirage) {
      this.updateMirage();
    }

    this.gameObject.sendToClients<{
      player1: number;
      player2: number;
      ball: { x: number; y: number };
    }>('positionsUpdate', {
      player1: this.gameObject.player1.pos.y,
      player2: this.gameObject.player2.pos.y,
      ball: this.gameObject.ballPos,
    });
    if (
      this.gameObject.gameOptions.dodge ||
      this.gameObject.player1.deflect ||
      this.gameObject.player2.deflect
    ) {
      this.gameObject.sendToClients<{ player1X: number; player2X: number }>(
        'positionXUpdate',
        {
          player1X: this.gameObject.player1.pos.x,
          player2X: this.gameObject.player2.pos.x,
        },
      );
    }
  }
}
