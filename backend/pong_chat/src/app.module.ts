import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [GameModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway, GameGateway],
})
export class AppModule {}
