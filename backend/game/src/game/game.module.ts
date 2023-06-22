import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { Player } from './dto/player.dto';
import { gameObject } from './dto/gameObject';
import { GameCollection } from './gameCollection';
import { forwardRef } from '@nestjs/common';
import { Server } from 'socket.io';
import { Options } from './movement.dto';

@Module({
  providers: [
    GameService,
    GameGateway,
    GameCollection,
    gameObject,
    Server,
    Player,
    Options,
  ],
  controllers: [GameController],
})
export class GameModule {}
