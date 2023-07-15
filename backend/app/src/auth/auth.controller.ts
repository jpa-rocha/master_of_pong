import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { encode } from 'punycode';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private usersService: UsersService) {}

  // api/auth/signin
  @Get('signin')
  async handleLogin(@Query('param') param: string, @Res() res: Response) {
    console.log(param);
    const data = JSON.parse(decodeURIComponent(param));
    const token = await this.authService.signin(data);

    res.cookie('jwtToken', token, { httpOnly: false });
    return res.redirect('https://localhost:3000/main');
  }

  // api/auth/redirect
  @Get('redirect')
  @UseGuards(oauth2Guard)
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    // TODO: require Bearer token, validate token
    // res.set('Access-Control-Allow-Origin', 'localhost:3000');
    console.log('AT REDIRECT');

    // Send the response.
    console.log('AT REDIRECT: %s', req.user);
    const encodedData = encodeURIComponent(JSON.stringify(req.user));
    const redirectUrl = `signin?param=${encodedData}`;
    console.log('AT REDIRECT: %s', encodedData);
    return res.redirect(redirectUrl);
  }

  @Get('signout')
  handleSignout(@Res() res: Response) {
    console.log('signout BACKEND');
    res.cookie('jwtToken', '', { expires: new Date(0) });
    return res.redirect('https://localhost:3000/');
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(id: string) {
    let user = await this.usersService.findOne(id)
    user.is_2fa_enabled = true;
    this.usersService.update(user.id, user);
    return user
  };
}
