import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { Map } from './dto/map.dto';
import { Player } from './dto/player.dto';

@Module({
  providers: [
    GameService,
    GameGateway,
    { provide: 'Map', useClass: Map },
    { provide: 'Player1', useClass: Player },
    { provide: 'Player2', useClass: Player },
  ],
  controllers: [GameController],
})
export class GameModule {}
