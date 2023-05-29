import { Controller, Render, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Chat } from './chat.entity';
import { Game } from './game.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/chat')
  @Render('index')
  Home() {
    return { message: 'Hello world!' };
  }

  @Get('/api/chat')
  async Chat(@Res() res) {
    const messages = await this.appService.getMessages();
    res.json(messages);
  }

  @Get('/api/pos')
  async Game(@Res() res) {
    const pos = 200;
    res.json(pos);
  }
}
