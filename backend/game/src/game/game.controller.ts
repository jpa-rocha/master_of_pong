import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Options } from './movement.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // GAME --------------------------------------------

  @Get('gameStatus')
  gameStatus() {
    this.gameService.gameStatus();
  }

  @Post('options')
  createGameObject(@Body() options: Options) {
    this.gameService.createGameObject(options);
  }

  @Post('start')
  startGame() {
    this.gameService.startGame();
  }

  @Post('stop')
  stopGame() {
    this.gameService.stopGame();
  }

  // MOVEMENT ----------------------------------------

  @Post('move/up/enable')
  moveUpEnable() {
    this.gameService.moveUp();
  }

  @Post('move/stopup')
  stopUp() {
    this.gameService.stopUp();
  }

  @Post('move/down')
  moveDown() {
    this.gameService.moveDown();
  }

  @Post('move/stopdown')
  stopDown() {
    this.gameService.stopDown();
  }

  // SPECIAL ABILITIES -------------------------------

  @Post('ability/Scorpion')
  ultScorpion() {
    this.gameService.ultScorpion();
  }

  @Post('ability/SubZero')
  ultSubZero() {
    this.gameService.abFreeze();
  }

  @Post('ability/Raiden')
  Lightning() {
    this.gameService.abLightning();
  }

  // ABILITIES ---------------------------------------

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
    this.gameService.ultSubZero();
  }

  @Post('ability/soundgrenade')
  SoundGrenade() {
    this.gameService.SoundGrenade();
  }

  @Post('ability/biggerball')
  BallSize() {
    this.gameService.BallSize();
  }

  @Post('ability/smallerball')
  ballReset() {
    this.gameService.ballReset();
  }

  @Post('ability/random')
  randomAbility() {
    this.gameService.randomAbility();
  }
}
