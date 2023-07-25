import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { use } from 'passport';
import { get } from 'http';

let users = [];

interface UsersProps {
  username: string;
  socketId: string;
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
  }

  @SubscribeMessage('newUser')
  async handleNewUser(
    client: Socket,
    data: { username: string; socketID: string },
  ) {
    console.log('Socket : ', data.socketID);
    console.log('Users  : ', data.username);
    if (users.some((user) => user.socketId === data.socketID)) {
      users.push(data);
      console.log('users (if): ', users);
    } else {
      // if that user has another socket assigned to him, remove it from users[]
      users = users.map((user) =>
        user.username === data.username
          ? { ...user, socketID: data.socketID }
          : user,
      );
      console.log('users (else): ', users);
    }
    this.server.emit('newUserResponse', users);
  }
}
