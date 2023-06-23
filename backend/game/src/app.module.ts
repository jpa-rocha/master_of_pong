import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { Server } from 'socket.io';

@Module({
  imports: [GameModule],
  controllers: [AppController],
  providers: [AppService, Server],
})
export class AppModule {}
