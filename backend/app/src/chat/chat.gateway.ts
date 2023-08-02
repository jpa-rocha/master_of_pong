import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway(5050, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UsersService,
  ) {}

  handleConnection(client: Socket) {
    console.log('user connected');
    this.server.emit('user connected');
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
  }

  // Sent from ChatPage after opening the chat page. Sets user socket and status
  @SubscribeMessage('activityStatus')
  async handleActivityStatus(
    client: Socket,
    data: { userID: string; status: string },
  ) {
    await this.userService.update(data.userID, {
      socketID: client.id,
      status: data.status,
    });
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
  }

  // called in ChatBar
  @SubscribeMessage('getChatRoom')
  async getChatRoomMessages(client: Socket, data: { chatID: number }) {
    const chat = await this.chatService.findOneChat(data.chatID);
    this.server.to(client.id).emit('returnChat', chat);
  }

  @SubscribeMessage('getMessages')
  async getMessages(client: Socket, data: { chatID: number }) {
    const messages = await this.chatService.getChatMessages(data.chatID);
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
    this.server.to(client.id).emit('renderChatBar');
    return result;
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
