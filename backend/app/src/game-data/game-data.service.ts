import { Inject, Injectable, Param } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GameData } from './entities/game-data.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameDataService {
  constructor(
    @InjectRepository(GameData)
    private gameDataRepository: Repository<GameData>,
  ) {}

  create(createGameDto: CreateGameDto) {
    const newGameData = this.gameDataRepository.create(createGameDto);
    return this.gameDataRepository.save(newGameData);
  }

  findAll() {
    return this.gameDataRepository.find();
  }

  async getUserMatches(userID: string) {
    const games = await this.gameDataRepository
      .createQueryBuilder('gameData')
      .leftJoinAndSelect('gameData.userOne', 'userOne')
      .leftJoinAndSelect('gameData.userTwo', 'userTwo')
      .leftJoinAndSelect('gameData.winner', 'winner')
      .where('userOne.id = :userID OR userTwo.id = :userID', { userID })
      .getMany();
    return games;
  }
}
