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
import { User } from 'src/users/entities/user.entity';

interface UsersProps {
  username: string;
  socketId: string;
}

interface ChatProp {
  id: number;
  users: User[];
}

@WebSocketGateway(5050, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UsersService,
  ) {}

  // @SubscribeMessage('createChat')
  // create(@MessageBody() createChatDto: CreateChatDto) {
  //   return this.chatService.create(createChatDto);
  // }

  // @SubscribeMessage('findAllChat')
  // findAll() {
  //   return this.chatService.findAll();
  // }

  // @SubscribeMessage('findOneChat')
  // findOne(@MessageBody() id: number) {
  //   return this.chatService.findOne(id);
  // }

  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(updateChatDto.id, updateChatDto);
  // }

  // @SubscribeMessage('removeChat')
  // remove(@MessageBody() id: number) {
  //   return this.chatService.remove(id);
  // }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: any): void {
    // console.log('message received');
    // console.log(message);
    this.server.emit('message', message);
  }

  handleConnection(client: Socket) {
    console.log('user connected');
    //user is online
    //Update database
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
    this.server
      .to(client.id)
      .emit('newUserResponse', await this.userService.getFriends(userID));
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
    console.log('Chat Gateway reached');
    // console.log(data.user1ID, data.user2ID);
    this.server
      .to(client.id)
      .emit(
        'returnDirectChat',
        await this.chatService.findDirectChat(data.user1ID, data.user2ID),
      );
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, data: { chatID: number; message: string }) {
    await this.chatService.sendMessage(
      await this.userService.findIDbySocketID(client.id),
      data.chatID,
      data.message,
    );
    const messages = await this.chatService.getChatMessages(data.chatID);

    const chat = await this.chatService.findOneChat(data.chatID);
    console.log('Chat = ', chat);
    chat.users.forEach((user) => {
      console.log('LABASSSSSSSSSSSSSSSS');
      this.server.to(user.socketID).emit('message', messages);
    });
  }

  @SubscribeMessage('getMessages')
  async getMessages(client: Socket, data: { chatID: number }) {
    this.server
      .to(client.id)
      .emit('message', await this.chatService.getChatMessages(data.chatID));
  }
}
