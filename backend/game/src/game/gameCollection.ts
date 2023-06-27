import { GameObject } from './gameObject';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './dto/types';
import { Options } from './movement.dto';
import { Mode } from './enums/Modes';
import { Player } from './dto/player.dto';

export class GameCollection {
  public server: Server;

  private readonly gameObjects: Map<GameObject['gameID'], GameObject> = new Map<
    GameObject['gameID'],
    GameObject
  >();

  public playerReady(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.ready = true;
    else if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.ready = true;
    if (
      client.data.lobby.player1.ready === true &&
      client.data.lobby.player2.ready === true
    ) {
      client.data.lobby.gameService.startGame();
    }
  }

  public moveUpEnable(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.moveUp = true;
    else if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.moveUp = true;
  }

  public moveUpDisable(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.moveUp = false;
    else if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.moveUp = false;
  }

  public moveDownEnable(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.moveDown = true;
    else if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.moveDown = true;
  }

  public moveDownDisable(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.moveDown = false;
    else if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.moveDown = false;
  }

  public useSpecial(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.useSpecial = true;
    if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.useSpecial = true;
  }

  public useAbility(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id)
      client.data.lobby.player1.useAbility = true;
    if (client.data.lobby.player2.id === client.id)
      client.data.lobby.player2.useAbility = true;
  }

  public initialiseSocket(client: AuthenticatedSocket) {
    client.data.lobby = null;
  }

  public terminateSocket(client: AuthenticatedSocket) {
    const id = client.data.lobby?.gameID;
    client.data.lobby?.removeClient(client);
    if (this.gameObjects.delete(id)) this.totalGameCount--;
  }

  public createGame(client: AuthenticatedSocket, options: Options): void {
    console.log('creating/finding game');
    console.log('gamemode: ' + options.gameMode);
    console.log('Singleplayer: ' + Mode.Singleplayer);
    console.log('Regular: ' + Mode.Regular);
    if (options.gameMode !== Mode.Singleplayer) {
      console.log('inside if statement');
      console.log('total game count: ' + this.totalGameCount);
      const keys = Array.from(this.gameObjects.keys()); // Retrieve all keys
      let current: GameObject;
      for (let i = 0; i < this.totalGameCount; i++) {
        current = this.gameObjects.get(keys[i]);
        console.log('Looking for game...');
        if (
          current.player1.options.gameMode === options.gameMode &&
          current.clients.size === 1
          // Iterating over the Map
        ) {
          current.player2 = new Player(this.server, options);
          current.player2.pos.x = 1170;
          console.log('Returning an already created game');
          current.addClient(client);
          return;
        }
      }
    }
    console.log('creating a new game');
    const game = new GameObject(this.server, options);
    this.gameObjects.set(game.gameID, game);
    this.totalGameCount++;
    game.addClient(client);
    return;
  }

  public joinGame(gameID: string, client: AuthenticatedSocket) {
    const game = this.gameObjects.get(gameID);
    if (!game) {
      console.log('oh no');
    } else if (
      (game.clients.size === 1 &&
        game.player1.options.gameMode === Mode.Singleplayer) ||
      game.clients.size === 2
    ) {
      console.log('oh no');
    }
    console.log('Adding client...');
    game.addClient(client);
    // console.log('Starting game...');
    // game.gameService.startGame();
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
