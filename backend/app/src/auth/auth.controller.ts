import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { oauth2Guard } from './utils/auth.guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';
import { ConfigService } from '@nestjs/config';
import TwoFactorGuard from 'src/two-factor-authentication/two-factor-authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtAuthService,
    private configService: ConfigService,
  ) {}

  // api/auth/signin
  @Get('signin')
  async handleLogin(@Query('param') param: string, @Res() res: Response) {
    console.log('-------------------AT SIGNIN-------------------');

    const data = JSON.parse(decodeURIComponent(param));

    const token = await this.authService.signin(data);

    res.cookie(this.configService.get<string>('REACT_APP_JWT_NAME'), token, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });

    return res.redirect(
      `${this.configService.get<string>('REACT_APP_FRONTEND')}/main`,
    );
  }

  @Post('verifyToken')
  async verifyToken(@Body() body) {
    const token = body.token;
    const secret = this.configService.get<string>('JWT_SECRET');

    return this.jwtService.verifyToken(token, secret);
  }

  @Post('getUserID')
  async getUserID(@Body() body) {
    const token = body.token;
    console.log(token);
    return this.jwtService.getTokenInformation(token);
  }

  @Get('redirect')
  @UseGuards(oauth2Guard)
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    // TODO: require Bearer token, validate token
    // res.set('Access-Control-Allow-Origin', 'localhost:3000');
    console.log('AT REDIRECT');

    // Send the response.
    const encodedData = encodeURIComponent(JSON.stringify(req.user));
    const redirectUrl = `signin?param=${encodedData}`;
    return res.redirect(redirectUrl);
  }

  @Get('signout')
  @UseGuards(TwoFactorGuard)
  handleSignout(@Res() res: Response) {
    res.cookie(this.configService.get<string>('REACT_APP_JWT_NAME'), '', {
      expires: new Date(0),
    });
    return res.redirect(this.configService.get<string>('REACT_APP_FRONTEND'));
  }
}
