import { Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('gameStatus')
  gameStatus() {
    this.gameService.gameStatus();
  }

  @Post('start')
  startGame() {
    this.gameService.startGame();
  }

  @Post('stop')
  stopGame() {
    this.gameService.stopGame();
  }

  @Post('move/up/enable')
  moveUpEnable() {
    this.gameService.moveUp();
  }

  @Post('move/up/disable')
  moveUpDisable() {
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

  @Post('ultSubZero')
  ultSubZero() {
    this.gameService.ultSubZero();
  }

  @Post('ability/timewarp')
  TimeWarp() {
    this.gameService.abTimeWarp();
  }

  @Post('ability/mirage')
  Mirage() {
    this.gameService.abMirage();
  }

  @Post('ability/freeze')
  Freeze() {
    this.gameService.abFreeze();
  }

  @Post('ability/lightning')
  Lightning() {
    this.gameService.abLightning();
  }

  @Post('ability/soundgrenade')
  SoundGrenade() {
    this.gameService.SoundGrenade();
  }

  @Post('ability/ballsize')
  BallSize() {
    this.gameService.BallSize();
  }

  @Post('ability/ballreset')
  ballReset() {
    this.gameService.ballReset();
  }
}
