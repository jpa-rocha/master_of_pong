import { Module } from '@nestjs/common';
// import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameCollection } from './gameCollection';
import { Server } from 'socket.io';

@Module({
  providers: [GameGateway, GameCollection, Server],
  //   controllers: [GameController],
})
export class GameModule {}
