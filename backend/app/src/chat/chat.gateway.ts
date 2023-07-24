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

let users = [];

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
    this.server.emit('user connected');
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected');
    this.server.emit('user disconnected');
  }

  @SubscribeMessage('newUser')
  async handleNewUser(client: Socket, username: string) {
    const allusers = await this.userService.findAll();
    // get all the usernames from all the users in the json file and create an array of usernames
    const usernames = allusers.map((user) => user.username);

    console.log("username: ", username);
    users.push(username);
    // console.log('allUsers: ', usernames);
    // console.log('users: ', users);
    this.server.emit('newUserResponse', users);
  }
}
