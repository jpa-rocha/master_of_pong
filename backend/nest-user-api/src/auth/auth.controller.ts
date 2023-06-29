import { Controller, Get, UseGuards } from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';

@Controller('auth')
export class AuthController {
  // api/auth/signin
  @Get('signin')
  @UseGuards(oauth2Guard)
  handleLogin() {
    return { message: 'Auth login' }; // TODO: return JWT access token
  }

  // api/auth/redirect
  @Get('redirect')
  @UseGuards(oauth2Guard)
  handleRedirect() {
    // TODO: require Bearer token, validate token
    return { message: 'Auth redirect' };
  }
}
