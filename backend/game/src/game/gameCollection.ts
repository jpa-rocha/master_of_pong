import { gameObject } from './dto/gameObject';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './dto/types';
import { Options } from './movement.dto';

export class GameCollection {
  public server: Server;

  private readonly gameObjects: Map<gameObject['gameID'], gameObject> = new Map<
    gameObject['gameID'],
    gameObject
  >();

  public initialiseSocket(client: AuthenticatedSocket) {
    client.data.lobby = null;
  }

  public terminateSocket(client: AuthenticatedSocket) {
    client.data.lobby?.removeClient(client);
  }

  public createGame(options: Options): gameObject {
    const game = new gameObject(this.server, options);
    this.gameObjects.set(game.gameID, game);
    return game;
  }

  public joinGame(gameID: string, client: AuthenticatedSocket) {
    const game = this.gameObjects.get(gameID);
    if (!game) {
      console.log('oh no');
    } else if (
      (game.clients.size === 1 &&
        game.player1.options.gameMode === 'SinglePlayer') ||
      game.clients.size === 2
    ) {
      console.log('oh no');
    }
    game.addClient(client);
    game.gameService.startGame();
  }

  public totalGameCount: number;
  constructor() {
    this.totalGameCount = 0;
  }

  // public addGameObject(game: gameObject): void {
  //   this.gameObjects.set(game.gameID, game);
  //   this.totalGameCount++;
  // }

  // public checkAvailability(player: Player, i: number): boolean {
  //   if (player.options.gameMode === this.gameObjects[i].gameOptions.gameMode) {
  //     if (!this.gameObjects[i].player2) {
  //       this.gameObjects[i].setPlayer2(player);
  //       return true;
  //     }
  //   }
  //   return false;
  // }
}
