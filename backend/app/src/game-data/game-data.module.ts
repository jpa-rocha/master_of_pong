import { Module } from '@nestjs/common';
import { GameDataService } from './game-data.service';
import { GameDataController } from './game-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameData } from './entities/game-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameData])],
  controllers: [GameDataController],
  providers: [GameDataService],
})
export class GameDataModule {}
