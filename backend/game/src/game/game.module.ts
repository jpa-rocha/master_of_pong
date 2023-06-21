import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { Player } from './dto/player.dto';
import { gameObject } from './dto/gameObject';

@Module({
  providers: [
    GameService,
    GameGateway,
    { provide: 'gameObject', useClass: gameObject },
    { provide: 'Player1', useClass: Player },
    { provide: 'Player2', useClass: Player },
  ],
  controllers: [GameController],
})
export class GameModule {}
