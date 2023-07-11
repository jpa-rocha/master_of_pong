import { Module } from '@nestjs/common';
// import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameCollection } from './gameCollection';
import { Server } from 'socket.io';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameDataModule } from 'src/game-data/game-data.module';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { GameData } from 'src/game-data/entities/game-data.entity';
import { UsersService } from 'src/users/users.service';
import { GameDataService } from 'src/game-data/game-data.service';

@Module({
  imports: [
    GameDataModule,
    UsersModule,
    TypeOrmModule.forFeature([GameData]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    GameGateway,
    GameCollection,
    Server,
    UsersService,
    GameDataService,
  ],
  //   controllers: [GameController],
})
export class GameModule {}
