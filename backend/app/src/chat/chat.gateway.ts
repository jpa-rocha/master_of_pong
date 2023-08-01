import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { SpatialColumnOptions } from 'typeorm/decorator/options/SpatialColumnOptions';

@WebSocketGateway(5050, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UsersService,
  ) {}

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() message: any): void {
  //   this.server.emit('message', message);
  // }

  handleConnection(client: Socket) {
    console.log('user connected');
    this.server.emit('user connected');
  }

  async handleDisconnect(client: Socket) {
    console.log('user disconnected');
    // user is offline
    // Find whitch user is using this socket and update their status to offline
    try {
      await this.userService.updateSocket(client.id, {
        status: 'offline',
        socketID: null,
      });
    } catch (e) {
      console.log(e);
    }
    this.server.emit('user disconnected');
  }

  @SubscribeMessage('activityStatus')
  async handleActivityStatus(
    client: Socket,
    data: { userID: string; status: string },
  ) {
    this.userService.update(data.userID, {
      socketID: client.id,
      status: data.status,
    });
    this.server.emit('NewConnection');
  }

  @SubscribeMessage('newUser')
  async handleNewUser(client: Socket) {
    const userID = await this.userService.findIDbySocketID(client.id);
    const user = await this.userService.getFriends(userID);
    const chatRooms = await this.chatService.getChatRooms(userID);
    this.server
      .to(client.id)
      .emit('newUserResponse', { users: user, chatRooms: chatRooms });
  }

  @SubscribeMessage('channelMessage')
  async handleChannelMessage(client: Socket, message: string, channel: any) {
    /* 
      TODO
      1. Get the user ID from the socket ID
      2. Get channel ID from channel name
      3. Save message to database
      4. Emit message to all users in channel
    */
  }

  @SubscribeMessage('getDirectChat')
  async getDirectChat(
    client: Socket,
    data: { user1ID: string; user2ID: string },
  ) {
    console.log('GET DIRECT CHAT RECEIVED');
    const chat = await this.chatService.findDirectChat(
      data.user1ID,
      data.user2ID,
    );
    this.server.to(client.id).emit('returnDirectChat', chat);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, data: { chatID: number; message: string }) {
    await this.chatService.sendMessage(
      await this.userService.findIDbySocketID(client.id),
      data.chatID,
      data.message,
    );
    const messages = await this.chatService.getChatMessages(data.chatID);
    console.log('Returning this chat ID', messages.chatID);
    const chat = await this.chatService.findOneChat(data.chatID);
    chat.users.forEach((user) => {
      this.server.to(user.socketID).emit('message', messages);
    });
  }

  @SubscribeMessage('getMessages')
  async getMessages(client: Socket, data: { chatID: number }) {
    const messages = await this.chatService.getChatMessages(data.chatID);
    this.server.to(client.id).emit('message', messages);
  }

  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    client: Socket,
    data: { title: string; password: string },
  ) {
    console.log('CreateChatRoom Reached');
    console.log(data.title);
    console.log(data.password);
    const creatorID = await this.userService.findIDbySocketID(client.id);
    console.log(creatorID);
    this.server.to(client.id).emit('RenderChatBar');
    return this.chatService.createChatRoom(
      data.title,
      creatorID,
      data.password,
    );
    // this.server.to(client.id).emit('returnDirectChat', chat);
  }
  @SubscribeMessage('joinChatRoom')
  async jpinChatRoom(
    client: Socket,
    data: { title: string; password: string },
  ) {
    console.log('joinChatRoom Reached');
    console.log(data.title);
    console.log(data.password);
    const userID = await this.userService.findIDbySocketID(client.id);
    const chat = await this.chatService.findOneChatTitle(data.title);
    this.server.to(client.id).emit('RenderChatBar');
    return this.chatService.joinChatRoom(userID, chat.id, data.password);
  }

  @SubscribeMessage('getChatRoomMessages')
  async getChatRoomMessages(client: Socket, data: { chatID: number }) {
    console.log('Get ChatRoomMessages REACHED => chatID = ', data.chatID);
    const messages = await this.chatService.getChatMessages(data.chatID);
    const chat = await this.chatService.findOneChat(data.chatID);
    this.server.to(client.id).emit('returnDirectChat', chat);
    this.server.to(client.id).emit('message', messages);
    console.log('MESSAGES ------------------------------------');
    console.log(messages);
    console.log('---------------------------------------------');
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
}
