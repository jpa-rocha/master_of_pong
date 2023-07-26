import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { encode } from 'punycode';
import { UsersService } from 'src/users/users.service';
import { strict } from 'assert';

@Controller('auth')
export class AuthController {
  jwtAuthService: any;
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtAuthService,
  ) {}

  // api/auth/signin
  @Get('signin')
  async handleLogin(@Query('param') param: string, @Res() res: Response) {
    console.log(param);
    const data = JSON.parse(decodeURIComponent(param));
    const token = await this.authService.signin(data);

    res.cookie('jwtToken', token, { httpOnly: false });
    return res.redirect('https://localhost:3000/main');
  }

  @Post('verifyToken')
  async verifyToken(@Body() body) {
    console.log(
      'HEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    );
    const token = body.token;
    const secret = 'alsosecret';

    return this.jwtService.verifyToken(token, secret);
  }

  @Post('getUserID')
  async getUserID(@Body() body) {
    console.log('GETUSERID backend');
    const token = body.token;

    return this.jwtService.getTokenInformation(token);
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
    res.cookie('jwtToken', '', { expires: new Date(0) });
    return res.redirect('https://localhost:3000/');
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(id: string) {
    console.log('2fa/turn-on');
    const user = await this.usersService.findOne(id);
    user.is_2fa_enabled = true;
    this.usersService.update(user.id, user);
    return user;
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard)
  async authenticate(@Req() req: Request, @Body() body) {
    const cookieHeader = req.headers.cookie;
    const cookie = cookieHeader
      .split(';')
      .find((cookie) => cookie.trim().startsWith('jwtToken='));
    const token = cookie.split('=')[1];

    console.log('Token = ', token);

    const id = this.jwtService.getTokenInformation(token);
    const user: User = await this.usersService.findOne(id);
    const isCodeValid = this.authService.isTwoFactorAuthenticationValid(
      body.twoFactorAuthenticationCode,
      user,
    );
    console.log('We reached this part! 111');
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code.');
    }
    console.log('We reached this part! 222');
    return this.authService.loginWithTwoFactorAuthentication(user);
  }
}
