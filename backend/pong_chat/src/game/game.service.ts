import { Inject, Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Map } from './dto/map.dto';
import { Player } from './dto/player.dto';

@Injectable()
export class GameService {
  private ballTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;

  private moveUpTimer: NodeJS.Timeout | null = null;
  private moveDownTimer: NodeJS.Timeout | null = null;

  private pressUp = 0;
  private pressDown = 0;

  constructor(
    private readonly gameGateway: GameGateway,
    @Inject('Map') private readonly map: Map,
    @Inject('Player1') private readonly player1: Player,
    @Inject('Player2') private readonly player2: Player,
  ) {}

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

  private moveBall(): void {
    if (this.map.gameStarted == false) return;

	if (this.pressUp == 1) {
		this.player1.pos.y -= this.player1.speed;
    	if (this.player1.pos.y < 0) this.player1.pos.y = 0;
	}
	if (this.pressDown == 1) {
		this.player1.pos.y += this.player1.speed;
		if (this.player1.pos.y > this.map.Height - this.player1.height)
			this.player1.pos.y = this.map.Height - this.player1.height;
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

    // Ball interaction with walls
    if (this.map.ballPos.x >= this.map.Width || this.map.ballPos.x <= 0) {
      if (this.map.ballPos.x >= this.map.Width) this.map.score.p1 += 1;
      if (this.map.ballPos.x <= 0) this.map.score.p2 += 1;
      if (this.map.score.p1 == 11 || this.map.score.p2 == 11) this.stopGame();
      this.map.ballPos.x = this.map.Width / 2;
      this.map.ballPos.y = this.map.Height / 2;
      this.map.ballVel.y = 1;
      this.map.ballVel.x = 5;
    }

    if (this.map.ballPos.y >= this.map.Height || this.map.ballPos.y <= 0) {
      this.map.ballVel.y = this.map.ballVel.y * -1;
    }

    // Ball interaction with player 1
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

    // Ball interaction with player 2
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
