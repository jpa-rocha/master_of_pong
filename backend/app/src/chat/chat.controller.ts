import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import TwoFactorGuard from 'src/two-factor-authentication/two-factor-authentication.guard';

@Controller('chat')
// @UseGuards(TwoFactorGuard)
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

}
