import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { GameGateway } from './game/game.gateway';
import { GameCollection } from './game/gameCollection';
import { GameService } from './game/game.service';
import { gameObject } from './game/dto/gameObject';
import { Server } from 'socket.io';
import { Player } from './game/dto/player.dto';
import { Options } from './game/movement.dto';

@Module({
  imports: [GameModule],
  controllers: [AppController],
  providers: [
    AppService,
    ChatGateway,
    GameGateway,
    GameCollection,
    GameService,
    gameObject,
    Server,
    Player,
    Options,
  ],
})
export class AppModule {}
