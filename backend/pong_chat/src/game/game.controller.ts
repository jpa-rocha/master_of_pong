import { Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  startGame() {
    this.gameService.startGame();
  }

  @Post('stop')
  stopGame() {
    this.gameService.stopGame();
  }

  @Post('move/up')
  moveUp() {
    this.gameService.moveUp();
  }

  @Post('move/stopup')
  stopUp() {
    this.gameService.stopUp();
  }

  @Post('move/stopdown')
  stopDown() {
    this.gameService.stopDown();
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
