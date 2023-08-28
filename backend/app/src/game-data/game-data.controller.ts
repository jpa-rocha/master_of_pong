import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GameDataService } from './game-data.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('game-data')
export class GameDataController {
  constructor(private readonly gameDataService: GameDataService) {}

  @Post()
  create(@Body() createGameDatumDto: CreateGameDto) {
    return this.gameDataService.create(createGameDatumDto);
  }

  @Get()
  findAll() {
    return this.gameDataService.findAll();
  }

  @Get(':id')
  getUserMatches(@Param('id') id: string) {
    return this.gameDataService.getUserMatches(id);
  }
}
