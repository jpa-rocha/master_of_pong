import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Options } from './movement.dto';
import { Inject, forwardRef } from '@nestjs/common';

@Controller('game')
export class GameController {
  constructor(
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
  ) {}

  // GAME --------------------------------------------

  @Get('gameStatus')
  // gameStatus() {
  //   this.gameService.gameStatus();
  // }

  // @Post('options')
  // createGameObject(@Body() options: Options) {
  //   this.gameService.createGameObject(options);
  // }
  @Post('start')
  startGame(@Body() client_id: string, options: Options) {
    this.gameService.startGame();
  }

  @Post('stop')
  stopGame() {
    this.gameService.stopGame();
  }

  // MATCHMAKING -------------------------------------

  // MOVEMENT ----------------------------------------

  @Post('move/up/enable')
  moveUpEnable() {
    //console.log('CONTROLER RECEIVED MOVING INSTRUCTIONS');
    this.gameService.moveUp();
  }

  @Post('move/stopup')
  stopUp() {
    //console.log('CONTROLER RECEIVED MOVING INSTRUCTIONS');
    this.gameService.stopUp();
  }

  @Post('move/down')
  moveDown() {
    //console.log('CONTROLER RECEIVED MOVING INSTRUCTIONS');
    this.gameService.moveDown();
  }

  @Post('move/stopdown')
  stopDown() {
    //console.log('CONTROLER RECEIVED MOVING INSTRUCTIONS');
    this.gameService.stopDown();
  }

  // SPECIAL ABILITIES -------------------------------

  @Post('ability/Scorpion')
  ultScorpion() {
    this.gameService.ultScorpion();
  }

  @Post('ability/SubZero')
  ultSubZero() {
    this.gameService.ultSubZero();
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
    this.gameService.abFreeze();
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

  @Post('ability/special')
  specialAbility() {
    this.gameService.specialAbility();
  }
}
