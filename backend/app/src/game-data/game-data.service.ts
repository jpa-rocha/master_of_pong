import { Inject, Injectable } from '@nestjs/common';
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

  // TODO add a game id, or find a way to find all games played by a player by passing User
  // findOne(id: number) {
  //   return `This action returns a #${id} gameDatum`;
  // }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return `This action updates a #${id} gameDatum`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} gameDatum`;
  // }
}
