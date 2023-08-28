import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { GameCollection } from 'src/game/gameCollection';
import { GameDataService } from 'src/game-data/game-data.service';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import { AuthenticatedSocket } from 'src/game/dto/types';
import { CreateGameDto } from 'src/game-data/dto/create-game.dto';
import { Options } from 'src/game/movement.dto';
import TwoFactorGuard from 'src/two-factor-authentication/two-factor-authentication.guard';
import { UseGuards } from '@nestjs/common';

const userTimers: { [userID: string]: { [chatID: number]: NodeJS.Timeout } } =
  {};

@WebSocketGateway(5050, { cors: '*' })
@UseGuards(TwoFactorGuard)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UsersService,
    private gameCollection: GameCollection,
    private gameDataService: GameDataService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('user connected');
    this.gameCollection.initialiseSocket(client as AuthenticatedSocket);
    try {
      await this.userService.updateSocket(client.id, {
        status: 'online',
        socketID: client.id,
      });
    } catch (e) {
      console.log(e);
    }
    this.server.emit('user connected');
    this.server.emit('user connected bar');
    this.server.emit('user connected users');
  }

  async handleDisconnect(client: Socket) {
    console.log('user disconnected');
    const id = await this.userService.findIDbySocketID(client.id);
    this.userService.removeGameID(id);
    try {
      await this.userService.updateSocket(client.id, {
        status: 'offline',
        socketID: null,
      });
    } catch (e) {
      console.log(e);
    }
    this.gameCollection.terminateSocket(client);
    this.server.emit('user disconnected');
    this.server.emit('user disconnected bar');
    this.server.emit('user disconnected users');
  }

  afterInit(server: Server): any {
    // Pass server instance to managers
    this.gameCollection.server = server;

    // this.logger.log('Game server initialized !');
  }

  // Sent from ChatPage after opening the chat page. Sets user socket and status
  // TODO make a separate activity status
  @SubscribeMessage('activityStatus')
  async handleActivityStatus(
    client: Socket,
    data: { userID: string; status: string },
  ) {
    await this.userService.update(data.userID, {
      socketID: client.id,
      status: data.status,
    });
    this.server.emit('user connected bar');
    this.server.emit('user connected users');
  }

  @SubscribeMessage('getChatBar')
  async getChatBar(client: Socket, data: { userID: string }) {
    const friends = await this.userService.getFriends(data.userID);
    const directChat = await this.chatService.getDirectChats(data.userID);
    const chatRooms = await this.chatService.getChatRooms(data.userID);
    this.server.to(client.id).emit('returnChatBar', {
      friends: friends,
      direct: directChat,
      chatRooms: chatRooms,
    });
  }

  // called in ChatBar
  @SubscribeMessage('getDirectChat')
  async getDirectChat(
    client: Socket,
    data: { user1ID: string; user2ID: string },
  ) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const target = await this.userService.findOne(data.user2ID);
    const chat = await this.chatService.findDirectChat(
      data.user1ID,
      data.user2ID,
      userID,
    );
    this.server.to(client.id).emit('renderChatBar');
    this.server.to(target.socketID).emit('renderChatBar');
    this.server.to(client.id).emit('returnChat', chat);
    this.server.to(client.id).emit('returnChatFooter', chat);
    this.server.to(client.id).emit('returnChatUsers', chat);
  }

  // called in ChatBar
  @SubscribeMessage('getChatRoom')
  async getChatRoomMessages(client: Socket, data: { chatID: number }) {
    const chat = await this.chatService.findOneChat(data.chatID);
    this.server.to(client.id).emit('returnChat', chat);
    this.server.to(client.id).emit('returnChatFooter', chat);
    this.server.to(client.id).emit('returnChatUsers', chat);
  }

  @SubscribeMessage('getMessages')
  async getMessages(client: Socket, data: { chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const messages = await this.chatService.getChatMessages(
      data.chatID,
      userID,
    );
    this.server.to(client.id).emit('message', messages);
  }

  // called in ChatBar
  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    client: Socket,
    data: { title: string; password: string },
  ) {
    if (
      !(await this.chatService.checkName(data.title)) ||
      data.title.length <= 0 ||
      data.title.length > 20 ||
      !/^[a-zA-Z0-9]+$/.test(data.title) ||
      data.password.length > 50
    ) {
      return;
    }
    const creatorID = await this.userService.findIDbySocketID(client.id);
    const result = await this.chatService.createChatRoom(
      data.title,
      creatorID,
      data.password,
    );
    this.server.to(client.id).emit('renderChatBar');
    return result;
  }

  // called in ChatBar
  @SubscribeMessage('joinChatRoom')
  async joinChatRoom(
    client: Socket,
    data: { title: string; password: string },
  ) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.findOneChatTitle(data.title);
    const result = await this.chatService.joinChatRoom(
      userID,
      chat.id,
      data.password,
    );
    result.users.forEach((user) => {
      this.server.to(user.socketID).emit('renderChatBar');
      this.server.to(user.socketID).emit('returnChatUsersOnly', result);
    });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, data: { chatID: number; message: string }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    await this.chatService.sendMessage(userID, data.chatID, data.message);
    const messages = await this.chatService.getChatMessages(
      data.chatID,
      userID,
    );
    const chat = await this.chatService.findOneChat(data.chatID);
    chat.users.forEach(async (user) => {
      let index = -1;
      const tmp = await this.userService.findOne(user.id);
      if (tmp.blocked)
        index = tmp.blocked.findIndex((user) => user.id === userID);
      if (index === -1) this.server.to(user.socketID).emit('message', messages);
    });
  }

  @SubscribeMessage('checkChatRoomName')
  async checkChatRoomName(client: Socket, data: { name: string }) {
    return await this.chatService.checkName(data.name);
  }

  @SubscribeMessage('checkChatRoomPassword')
  async checkChatRoomPassword(
    client: Socket,
    data: { id: number; password: string },
  ) {
    return await this.chatService.checkPassword(data.id, data.password);
  }

  @SubscribeMessage('getChatRooms')
  async getChatRooms(client: Socket, data: { name: string }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chatRooms = await this.chatService.getChatRoomsJoin(
      userID,
      data.name,
    );
    this.server.to(client.id).emit('joinableRooms', chatRooms);
  }

  @SubscribeMessage('addAdmin')
  async addAdmin(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chatRoom = await this.chatService.addAdmin(
      userID,
      data.userID,
      data.chatID,
    );
    chatRoom.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chatRoom);
    });
    this.server.to(client.id).emit('returnChatUsersOnly', chatRoom);
    return chatRoom;
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chatRoom = await this.chatService.removeAdmin(
      userID,
      data.userID,
      data.chatID,
    );
    chatRoom.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chatRoom);
    });
    this.server.to(client.id).emit('returnChatUsersOnly', chatRoom);
    return chatRoom;
  }

  @SubscribeMessage('leaveChat')
  async leaveChat(client: Socket, data: { chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.leaveChat(userID, data.chatID);
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('renderChatBar');
      this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
    });
  }

  @SubscribeMessage('kickUser')
  async kickUser(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const user = await this.userService.findOne(userID);
    const target = await this.userService.findOne(data.userID);
    const chat = await this.chatService.kickUser(
      userID,
      data.userID,
      data.chatID,
    );
    this.server.to(user.socketID).emit('renderChatBar');
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
    });
    this.server.to(target.socketID).emit('checkKick', chat);
  }

  @SubscribeMessage('banUser')
  async banUser(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const user = await this.userService.findOne(userID);
    const target = await this.userService.findOne(data.userID);
    const chat = await this.chatService.banUser(
      userID,
      data.userID,
      data.chatID,
    );
    this.server.to(user.socketID).emit('renderChatBar');
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
      this.server.to(user.socketID).emit('returnChat', chat);
    });
    this.server.to(target.socketID).emit('checkKick', chat);
  }

  @SubscribeMessage('unbanUser')
  async unbanUser(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.unbanUser(
      userID,
      data.userID,
      data.chatID,
    );
    chat.admins.forEach((user) => {
      this.server.to(user.socketID).emit('returnChat', chat);
    });
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    client: Socket,
    data: { userID: string; chatID: number; time: number },
  ) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.muteUser(
      userID,
      data.userID,
      data.chatID,
    );
    if (data.time != 0) {
      const unmuteTimer = setTimeout(async () => {
        const chat2 = await this.chatService.unmuteUser(
          userID,
          data.userID,
          data.chatID,
        );
        chat2.users.forEach((user) => {
          this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
        });
      }, data.time);
      if (!userTimers[data.userID]) {
        userTimers[data.userID] = {};
      }
      userTimers[data.userID][data.chatID] = unmuteTimer;
    }
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
    });
  }

  @SubscribeMessage('unmuteUser')
  async unmuteUser(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.unmuteUser(
      userID,
      data.userID,
      data.chatID,
    );
    if (userTimers[data.userID] && userTimers[data.userID][data.chatID]) {
      clearTimeout(userTimers[data.userID][data.chatID]);
      delete userTimers[data.userID][data.chatID];
    }
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsersOnly', chat);
    });
  }

  @SubscribeMessage('changePassword')
  async changePassword(
    client: Socket,
    data: { password: string; chatID: number },
  ) {
    if (data.password.length > 50) return;
    return await this.chatService.changePassword(data.password, data.chatID);
  }

  @SubscribeMessage('blockUser')
  async blockUser(client: Socket, data: { targetID: string; chatID: number }) {
    // contact usersservice to add the target to the blocked users relation
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.findOneChat(data.chatID);
    await this.userService.blockUser(userID, data.targetID);
    await this.getMessages(client, { chatID: data.chatID });
    this.server.to(client.id).emit('returnChatUsersOnly', chat);
  }

  @SubscribeMessage('unblockUser')
  async unblockUser(
    client: Socket,
    data: { targetID: string; chatID: number },
  ) {
    // contact usersservice to remove the target from the blocked users relation
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.findOneChat(data.chatID);
    await this.userService.unblockUser(userID, data.targetID);
    await this.getMessages(client, { chatID: data.chatID });
    this.server.to(client.id).emit('returnChatUsersOnly', chat);
  }

  @SubscribeMessage('checkMuted')
  async checkMuted(
    client: Socket,
    data: {
      userID: string;
      adminID: string[];
      regularID: string[];
      chatID: number;
    },
  ) {
    const meResult = await this.chatService.checkMuted(
      data.userID,
      data.chatID,
    );
    const adminResult = await this.chatService.checkMutedArray(
      data.adminID,
      data.chatID,
    );
    const regularResult = await this.chatService.checkMutedArray(
      data.regularID,
      data.chatID,
    );
    this.server
      .to(client.id)
      .emit('isMutedReturn', meResult, adminResult, regularResult);
  }

  @SubscribeMessage('checkMutedUser')
  async checkMutedUser(
    client: Socket,
    data: { targetID: string; chatID: number },
  ) {
    const result = await this.chatService.checkMuted(
      data.targetID,
      data.chatID,
    );
    this.server.to(client.id).emit('isMutedUserReturn', result);
  }

  @SubscribeMessage('checkBlocked')
  async checkBlocked(client: Socket, data: { targetID: string }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const result = await this.chatService.checkBlocked(userID, data.targetID);
    this.server.to(client.id).emit('isBlockedReturn', result);
  }

  @SubscribeMessage('checkBlockedUsers')
  async checkBlockedUsers(
    client: Socket,
    data: {
      userID: string;
      ownerID: string;
      adminID: string[];
      regularID: string[];
    },
  ) {
    const ownerResult = await this.chatService.checkBlocked(
      data.userID,
      data.ownerID,
    );
    const adminResult = await this.chatService.checkBlockedArray(
      data.userID,
      data.adminID,
    );
    const regularResult = await this.chatService.checkBlockedArray(
      data.userID,
      data.regularID,
    );
    this.server
      .to(client.id)
      .emit('isBlockedUsersReturn', ownerResult, adminResult, regularResult);
  }

  @SubscribeMessage('checkBlockedDirect')
  async checkBlockedDirect(client: Socket, data: { targetID: string[] }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const result = await this.chatService.checkBlockedArray(
      userID,
      data.targetID,
    );
    this.server.to(client.id).emit('isDirectBlockedReturn', result);
  }

  @SubscribeMessage('moveDownEnable')
  gameMoveDownEnable(client: AuthenticatedSocket): void {
    this.gameCollection.moveDownEnable(client);
  }

  @SubscribeMessage('moveDownDisable')
  gameMoveDownDisable(client: AuthenticatedSocket): void {
    this.gameCollection.moveDownDisable(client);
  }

  @SubscribeMessage('moveUpEnable')
  gameMoveUpEnable(client: AuthenticatedSocket): void {
    this.gameCollection.moveUpEnable(client);
  }

  @SubscribeMessage('moveUpDisable')
  gameMoveUpDisable(client: AuthenticatedSocket): void {
    this.gameCollection.moveUpDisable(client);
  }

  @SubscribeMessage('moveEnable')
  gameMoveEnable(client: AuthenticatedSocket, direction: number): void {
    this.gameCollection.moveEnable(client, direction);
  }

  @SubscribeMessage('moveDisable')
  gameMoveDisable(client: AuthenticatedSocket, direction: number): void {
    this.gameCollection.moveDisable(client, direction);
  }

  @SubscribeMessage('specialAbility')
  gameUseSpecial(client: AuthenticatedSocket): void {
    this.gameCollection.useSpecial(client);
  }

  // TODO WORK ON gameobject.allowAbilities

  @SubscribeMessage('randomAbility')
  gameUseAbility(client: AuthenticatedSocket): void {
    this.gameCollection.useAbility(client);
  }

  @SubscribeMessage('clearAbility')
  gameClearAbility(client: AuthenticatedSocket): void {
    this.gameCollection.clearAbility(client);
  }

  @SubscribeMessage('readyToPlay')
  async readyToPlay(client: AuthenticatedSocket) {
    this.gameCollection.playerReady(client);
    try {
      await this.userService.updateSocket(client.id, {
        status: 'in game',
      });
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('loadWindow')
  loadWindow(client: AuthenticatedSocket): void {
    this.server.to(client.id).emit('loadWindow', true);
  }

  @SubscribeMessage('start')
  initGame(client: AuthenticatedSocket, data: { opt: Options; token: string }) {
    this.gameCollection.createGame(
      client,
      data.opt,
      this.jwtAuthService.getTokenInformation(data.token),
    );
  }

  @SubscribeMessage('leaveQueue')
  leaveQueue(client: AuthenticatedSocket) {
    this.removeGameID(client.data.lobby.player1.databaseId);
    this.gameCollection.removeGame(client.data.lobby.gameID);
  }

  async addGameData(
    p1: string,
    p2: string,
    winner: string,
    date: Date,
    score1: number,
    score2: number,
    gameMode: string,
    gameModeOptions: string,
  ) {
    const gameDataDto: CreateGameDto = {
      userOne: await this.userService.findOne(p1),
      userTwo: await this.userService.findOne(p2),
      winner: await this.userService.findOne(winner),
      timestamp: date,
      gameMode: gameMode,
      gameModeOptions: gameModeOptions,
      score1: score1,
      score2: score2,
    };
    if (p1 === winner) {
      await this.userService.playerWon(p1);
      await this.userService.playerLost(p2);
      await this.userService.newELO(p1, p2);
    } else if (p2 === winner) {
      await this.userService.playerWon(p2);
      await this.userService.playerLost(p1);
      await this.userService.newELO(p2, p1);
    }
    await this.gameDataService.create(gameDataDto);
  }

  async getUserName(playerID: string) {
    return await this.userService.findOne(playerID);
  }

  @SubscribeMessage('sendChallenge')
  async sendChallenge(
    client: Socket,
    data: {
      userID: string;
      targetID: string;
      mode: number;
      hyper: boolean;
      dodge: boolean;
      character: number;
      paddle: number;
    },
  ) {
    const user = await this.userService.findOne(data.userID);
    const target = await this.userService.findOne(data.targetID);
    if (!user || user.status !== 'online' || user.gameID !== null) {
      this.server.to(client.id).emit('userUnavailable');
      return;
    }
    if (target.status !== 'online' || target.gameID !== null) {
      this.server
        .to(client.id)
        .emit('targetUnavailable', { username: target.username });
      return;
    }
    this.server.to(target.socketID).emit('challenge', {
      mode: data.mode,
      hyper: data.hyper,
      dodge: data.dodge,
      character: data.character,
      paddle: data.paddle,
      challengerID: data.userID,
      userID: data.targetID,
      challengerUsername: user.username,
    });
  }

  @SubscribeMessage('acceptChallenge')
  async acceptChallenge(
    client: AuthenticatedSocket,
    data: {
      userID: string;
      challengerID: string;
      mode: number;
      hyper: boolean;
      dodge: boolean;
      challengerCharacter: number;
      userCharacter: number;
      challengerPaddle: number;
      userPaddle: number;
    },
  ) {
    const challenger = await this.userService.findOne(data.challengerID);
    const user = await this.userService.findOne(data.userID);
    const options = new Options(
      data.mode,
      data.userPaddle,
      data.userCharacter,
      data.hyper,
      data.dodge,
    );
    await this.userService.updateSocket(user.socketID, {
      status: 'in queue',
      socketID: user.socketID,
    });
    await this.userService.updateSocket(challenger.socketID, {
      status: 'in queue',
      socketID: challenger.socketID,
    });
    this.server.to(challenger.socketID).emit('challengeAccepted');
    this.server.to(user.socketID).emit('challengeAccepted');
    this.gameCollection.createGame(client, options, data.userID, true);
    this.server.to(challenger.socketID).emit('pleaseJoinGame');
  }

  @SubscribeMessage('joinChallengeGame')
  async joinChallengeGame(
    client: AuthenticatedSocket,
    data: {
      userID: string;
      targetID: string;
      mode: number;
      hyper: boolean;
      dodge: boolean;
      character: number;
      paddle: number;
    },
  ) {
    const options = new Options(
      data.mode,
      data.paddle,
      data.character,
      data.hyper,
      data.dodge,
    );
    this.gameCollection.joinGame(client, options, data.targetID, data.userID);
  }

  @SubscribeMessage('declineChallenge')
  async declineChallenge(
    client: Socket,
    data: { userID: string; challengerID: string },
  ) {
    const challenger = await this.userService.findOne(data.challengerID);
    this.server.to(challenger.socketID).emit('challengeDeclined');
  }

  @SubscribeMessage('checkOngoingGame')
  async checkOngoingGame(client: Socket) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const user = await this.userService.findOne(userID);
    if (user.gameID === null || user.status === 'in queue') return;
    this.gameCollection.findGame(client, user.gameID);
    await this.userService.updateSocket(client.id, {
      status: 'in game',
    });
  }

  removeGameID(userID: string) {
    this.userService.removeGameID(userID);
  }

  addGameID(userID: string, gameID: string) {
    this.userService.addGameID(userID, gameID);
  }

  removeGame(gameID: string) {
    this.gameCollection.removeGame(gameID);
  }

  async failedToJoin(userID: string) {
    const user = await this.userService.findOne(userID);
    this.server.to(user.socketID).emit('failedToJoin');
  }

  @SubscribeMessage('informFriendsPage')
  async informFriendsPage(client: Socket, data: { targetID: string }) {
    const target = await this.userService.findOne(data.targetID);
    if (target.socketID != null)
      this.server.to(target.socketID).emit('updateFriendsPage');
  }

  // exitLobby(socketID: string) {
  //   this.gameCollection.terminateSocket(socketID);
  // }
}
