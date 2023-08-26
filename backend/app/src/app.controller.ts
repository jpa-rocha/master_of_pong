import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import TwoFactorGuard from './two-factor-authentication/two-factor-authentication.guard';

@Controller()
@UseGuards(TwoFactorGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
