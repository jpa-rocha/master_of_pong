import { gameObject } from './dto/gameObject';
import { Injectable } from '@nestjs/common';
import { Player } from './dto/player.dto';

@Injectable()
export class gameCollection {
  public totalGameCount: number;
  public gameList: gameObject[];
  constructor() {
    this.totalGameCount = 0;
    this.gameList = [];
  }

  public addGameObject(game: gameObject): void {
    this.gameList.push(game);
    this.totalGameCount++;
  }

  public checkAvailability(player: Player, i: number): boolean {
    if (player.options.gameMode === this.gameList[i].gameOptions.gameMode) {
      if (!this.gameList[i].player2) {
        this.gameList[i].setPlayer2(player);
        return true;
      }
    }
    return false;
  }
}
