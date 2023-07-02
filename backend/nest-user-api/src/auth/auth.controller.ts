import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // api/auth/signin
  @Get('signin')
  handleLogin(user: string) {
    console.log(user)
    const data = JSON.parse(decodeURIComponent(user));
    return this.authService.signin(data);
    // return this.authService.signin(); // TODO: return JWT access token
  }

  // api/auth/redirect
  @Get('redirect')
  @UseGuards(oauth2Guard)
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    // TODO: require Bearer token, validate token
    console.log("AT REDIRECT")


    // Send the response.
    console.log("AT REDIRECT: %s", req.user)
    const encodedData = encodeURIComponent(JSON.stringify(req.user));
    const redirectUrl = `signin?param=${encodedData}`;
    return res.redirect(redirectUrl)

  }
}
