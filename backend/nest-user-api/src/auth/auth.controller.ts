import { Controller, Get, UseGuards } from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';

@Controller('auth')
export class AuthController {
  // api/auth/login
  @Get('signin')
  @UseGuards(oauth2Guard)
  handleLogin() {
    return { message: 'Auth login' };
  }

  // api/auth/redirect
  @Get('redirect')
  @UseGuards(oauth2Guard)
  handleRedirect() {
    return { message: 'Auth redirect' };
  }
}
