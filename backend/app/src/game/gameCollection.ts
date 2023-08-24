import { GameObject } from './gameObject';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './dto/types';
import { Options } from './movement.dto';
import { Mode } from './enums/Modes';
import { Player } from './dto/player.dto';
import { Inject, forwardRef } from '@nestjs/common';
// import { GameGateway } from './game.gateway';
import { UsersService } from '../users/users.service';
import { ChatGateway } from 'src/chat/chat.gateway';

export class GameCollection {
  public server: Server;
  public totalGameCount: number;

  constructor(
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly userService: UsersService,
  ) {
    this.totalGameCount = 0;
  }

  private readonly gameObjects: Map<GameObject['gameID'], GameObject> = new Map<
    GameObject['gameID'],
    GameObject
  >();

  private readonly premadeGames: Map<string, GameObject> = new Map<
    string,
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

  public moveEnable(client: AuthenticatedSocket, direction: number) {
    if (client.data.lobby.player1.id === client.id) {
      if (direction === 1) client.data.lobby.player1.moveLeft = true;
      else if (direction === 2) client.data.lobby.player1.moveRight = true;
    } else if (client.data.lobby.player2.id === client.id) {
      if (direction === 1) client.data.lobby.player2.moveLeft = true;
      else if (direction === 2) client.data.lobby.player2.moveRight = true;
    }
  }

  public moveDisable(client: AuthenticatedSocket, direction: number) {
    if (client.data.lobby.player1.id === client.id) {
      if (direction === 1) client.data.lobby.player1.moveLeft = false;
      else if (direction === 2) client.data.lobby.player1.moveRight = false;
    } else if (client.data.lobby.player2.id === client.id) {
      if (direction === 1) client.data.lobby.player2.moveLeft = false;
      else if (direction === 2) client.data.lobby.player2.moveRight = false;
    }
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

  public clearAbility(client: AuthenticatedSocket) {
    if (client.data.lobby.player1.id === client.id) {
      client.data.lobby.player1.ability = 10;
      client.data.lobby.player1.useAbility = true;
    }
    if (client.data.lobby.player2.id === client.id) {
      client.data.lobby.player2.ability = 10;
      client.data.lobby.player2.useAbility = true;
    }
  }

  public initialiseSocket(client: AuthenticatedSocket) {
    client.data.lobby = null;
  }

  public terminateSocket(client: AuthenticatedSocket) {
    const id = client.data.lobby?.gameID;
    client.data.lobby?.removeClient(client);
    if (this.gameObjects.delete(id)) this.totalGameCount--;
  }

  public createGame(
    client: AuthenticatedSocket,
    options: Options,
    playerID: string,
    premade = false,
  ): void {
    console.log('GAMES = ', this.gameObjects);
    console.log('PREMADE = ', this.premadeGames);
    if (premade) {
      console.log('TARGET SOCKET = ', client.id);
      const game = new GameObject(this.server, options, this.chatGateway);
      game.setGameID(playerID);
      this.premadeGames.set(playerID, game);
      // this.userService.saveGameID(playerID, playerID);
      game.addClient(client, playerID);
    } else {
      if (options.gameMode !== Mode.Singleplayer) {
        const keys = Array.from(this.gameObjects.keys()); // Retrieve all keys
        let current: GameObject;
        for (let i = 0; i < this.totalGameCount; i++) {
          current = this.gameObjects.get(keys[i]);
          if (
            current.player1.options.gameMode === options.gameMode &&
            current.clients.size === 1 &&
            current.player1.options.hyper === options.hyper &&
            current.player1.options.dodge === options.dodge
          ) {
            current.player2 = new Player(this.server, options);
            current.player2.pos.x = 1180 - current.player2.width;
            console.log('Returning an already created game');
            // this.userService.saveGameID(playerID, current.gameID);
            current.addClient(client, playerID);
            return;
          }
        }
      }
      console.log('creating a new game');
      const game = new GameObject(this.server, options, this.chatGateway);
      this.gameObjects.set(game.gameID, game);
      this.totalGameCount++;
      // this.userService.saveGameID(playerID, game.gameID);
      game.addClient(client, playerID);
      this.userService.updateSocket(client.id, {
        status: 'in queue',
        socketID: client.id,
      });
      return;
    }
  }

  public joinGame(
    client: AuthenticatedSocket,
    options: Options,
    playerID: string,
    newPlayerID: string,
  ) {
    console.log('CHALLENGER SOCKET = ', client.id);
    console.log('playerID: ' + playerID);
    console.log('newPlayerID: ' + newPlayerID);
    console.log('game playerID: ' + this.premadeGames[0]);
    const game = this.premadeGames.get(playerID);
    console.log('Adding client...');
    game.player2 = new Player(this.server, options);
    game.player2.pos.x = 1180 - game.player2.width;
    console.log('Returning an already created game');
    // this.userService.saveGameID(newPlayerID, playerID);
    game.addClient(client, newPlayerID);
  }

  public findGame(client: AuthenticatedSocket, gameID: string) {
    let game: GameObject;
    console.log('GameObject = ', this.gameObjects);
    console.log('PremadeGames = ', this.premadeGames);
    game = this.gameObjects.get(gameID);
    if (!game) game = this.premadeGames.get(gameID);
    if (!game) return false;
    console.log('4');
    game.rejoin(client);
  }

  public removeGame(gameID: string) {
    let game: GameObject;
    game = this.gameObjects.get(gameID);
    if (game) {
      this.gameObjects.delete(gameID);
      this.totalGameCount--;
    } else {
      game = this.premadeGames.get(gameID);
      if (game) this.gameObjects.delete(gameID);
    }
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
