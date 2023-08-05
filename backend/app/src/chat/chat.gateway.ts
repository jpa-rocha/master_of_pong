import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { use } from 'passport';

@WebSocketGateway(5050, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('user connected');
    // try {
    //   await this.userService.updateSocket(client.id, {
    //     status: 'online',
    //     socketID: client.id,
    //   });
    // } catch (e) {
    //   console.log(e);
    // }
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
    try {
      await this.userService.updateSocket(client.id, {
        status: 'offline',
        socketID: null,
      });
    } catch (e) {
      console.log(e);
    }
    this.server.emit('user disconnected');
    this.server.emit('user disconnected bar');
    this.server.emit('user disconnected users');
  }

  // Sent from ChatPage after opening the chat page. Sets user socket and status
  @SubscribeMessage('activityStatus')
  async handleActivityStatus(
    client: Socket,
    data: { userID: string; status: string },
  ) {
    console.log('SET TO ONLINE');
    await this.userService.update(data.userID, {
      socketID: client.id,
      status: data.status,
    });
    this.server.emit('user connected bar');
    this.server.emit('user connected users');
  }

  // Returns all the chats rooms so they can be displayed in the ChatBar
  @SubscribeMessage('getChatBar')
  async getChatBar(client: Socket, data: { userID: string }) {
    const user = await this.userService.getFriends(data.userID);
    const chatRooms = await this.chatService.getChatRooms(data.userID);
    this.server
      .to(client.id)
      .emit('returnChatBar', { users: user, chatRooms: chatRooms });
  }

  // called in ChatBar
  @SubscribeMessage('getDirectChat')
  async getDirectChat(
    client: Socket,
    data: { user1ID: string; user2ID: string },
  ) {
    const chat = await this.chatService.findDirectChat(
      data.user1ID,
      data.user2ID,
    );
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
    console.log('MESSAGES = ', messages.messages);
    this.server.to(client.id).emit('message', messages);
  }

  // called in ChatBar
  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    client: Socket,
    data: { title: string; password: string },
  ) {
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
  async jpinChatRoom(
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
    });
    return result;
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
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('message', messages);
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
    console.log('add admin reached');
    const userID = await this.userService.findIDbySocketID(client.id);
    const chatRoom = await this.chatService.addAdmin(
      userID,
      data.userID,
      data.chatID,
    );
    chatRoom.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsers', chatRoom);
    });
    this.server.to(client.id).emit('returnChatUsers', chatRoom);
    return chatRoom;
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(client: Socket, data: { userID: string; chatID: number }) {
    console.log('remove admin reached');
    const userID = await this.userService.findIDbySocketID(client.id);
    const chatRoom = await this.chatService.removeAdmin(
      userID,
      data.userID,
      data.chatID,
    );
    chatRoom.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsers', chatRoom);
    });
    this.server.to(client.id).emit('returnChatUsers', chatRoom);
    return chatRoom;
  }

  @SubscribeMessage('leaveChat')
  async leaveChat(client: Socket, data: { chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.leaveChat(userID, data.chatID);
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('renderChatBar');
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
      this.server.to(user.socketID).emit('returnChatUsers', chat);
    });
    // this.server.to(target.socketID).emit('returnChat', null);
  }

  @SubscribeMessage('banUser')
  async banUser(client: Socket, data: { userID: string; chatID: number }) {
    console.log('BAN USER');
    const userID = await this.userService.findIDbySocketID(client.id);
    const user = await this.userService.findOne(userID);
    const target = await this.userService.findOne(data.userID);
    const chat = await this.chatService.banUser(
      userID,
      data.userID,
      data.chatID,
    );
    // TODO sent to user SOCKET not the ID
    // return the chat to chatBody so the banned users content updates
    this.server.to(user.socketID).emit('renderChatBar');
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsers', chat);
      this.server.to(user.socketID).emit('returnChat', chat);
    });
    // return this chat to current user and compare it with users current chat if it matches reaload the window
    // this.server.to(target.socketID).emit('returnChat', null);
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
  async muteUser(client: Socket, data: { userID: string; chatID: number }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.muteUser(
      userID,
      data.userID,
      data.chatID,
    );
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsers', chat);
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
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('returnChatUsers', chat);
    });
  }

  @SubscribeMessage('changePassword')
  async changePassword(
    client: Socket,
    data: { password: string; chatID: number },
  ) {
    console.log('Change PASSWORD REACHED');
    return await this.chatService.changePassword(data.password, data.chatID);
  }

  @SubscribeMessage('blockUser')
  async blockUser(client: Socket, data: { targetID: string; chatID: number }) {
    // contact usersservice to add the target to the blocked users relation
    const userID = await this.userService.findIDbySocketID(client.id);
    this.userService.blockUser(userID, data.targetID);
    await this.getMessages(client, { chatID: data.chatID });
  }

  @SubscribeMessage('unblockUser')
  async unblockUser(
    client: Socket,
    data: { targetID: string; chatID: number },
  ) {
    // contact usersservice to remove the target from the blocked users relation
    const userID = await this.userService.findIDbySocketID(client.id);
    this.userService.unblockUser(userID, data.targetID);
    await this.getMessages(client, { chatID: data.chatID });
  }

  @SubscribeMessage('checkMuted')
  async checkMuted(client: Socket, data: { targetID: string; chatID: number }) {
    const result = await this.chatService.checkMuted(
      data.targetID,
      data.chatID,
    );
    this.server.to(client.id).emit('isMutedReturn', result);
  }

  @SubscribeMessage('checkBlocked')
  async checkBlocked(client: Socket, data: { targetID: string }) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const result = await this.chatService.checkBlocked(userID, data.targetID);
    this.server.to(client.id).emit('isBlockedReturn', result);
  }
}
