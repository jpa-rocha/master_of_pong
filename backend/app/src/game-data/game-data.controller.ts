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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.gameDataService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
  //   return this.gameDataService.update(+id, updateGameDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.gameDataService.remove(+id);
  // }
}
