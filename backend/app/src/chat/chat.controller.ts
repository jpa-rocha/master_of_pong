import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(createChatDto);
  }

  @Get()
  getAll() {
    return this.chatService.findAllChat();
  }

  @Get('getDirect/:user1/:user2')
  //getDirectChat(@Body() data: {user1: string, user2: string}) {
  getDirectChat(@Param() param: {user1: string, user2: string}) {
    return this.chatService.findDirectChat(param.user1, param.user2);
  }
}
