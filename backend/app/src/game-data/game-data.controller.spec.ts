import { Test, TestingModule } from '@nestjs/testing';
import { GameDataController } from './game-data.controller';
import { GameDataService } from './game-data.service';

describe('GameDataController', () => {
  let controller: GameDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameDataController],
      providers: [GameDataService],
    }).compile();

    controller = module.get<GameDataController>(GameDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
