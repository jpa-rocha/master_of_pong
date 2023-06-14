import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorsInterceptor } from './cors.interceptor';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [GameModule],
  controllers: [AppController],
  providers: [
    AppService,
    ChatGateway,
    GameGateway,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorsInterceptor,
    },
  ],
})
export class AppModule {}
