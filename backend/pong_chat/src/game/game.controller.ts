import { Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  startGame() {
    this.gameService.startMovingBall();
  }

  @Post('stop')
  stopGame() {
    this.gameService.stopMovingBall();
  }

  @Post('move/up')
  moveUp() {
    this.gameService.moveUp();
  }

  @Post('move/down')
  moveDown() {
    this.gameService.moveDown();
  }

  @Post('ultScorpion')
  ultScorpion() {
    this.gameService.ultScorpion();
  }
}
