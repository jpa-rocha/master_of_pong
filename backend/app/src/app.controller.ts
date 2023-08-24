import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import TwoFactorGuard from './two-factor-authentication/two-factor-authentication.guard';
@Controller()
// @UseGuards(TwoFactorGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* 
    Test if API/backend is work
    
    @return {string} 'Hello World!'
  */
  @Get()
  @UseGuards(TwoFactorGuard)
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
