import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* 
    Test if API/backend is work
    
    @return {string} 'Hello World!'
  */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('login')
  login(): string {
    return 'This is the login page';
  }

  @Get('profile')
  getProfile(): string {
    return 'You are logged in';
  }
}
