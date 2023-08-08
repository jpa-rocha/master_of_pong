import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Param,
  Get,
  Body,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Console } from 'console';
import { AuthService } from 'src/auth/auth.service';
import { get } from 'http';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import TwoFactorGuard from './two-factor-authentication.guard';

@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly userService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly authService: AuthService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  @Post('generate/:id')
  // @UseGuards(JwtTwoFactorGuard)
  async register(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    console.log('---- 2FA generate ----');
    const user = await this.userService.findOne(id);
    const otpauthUrl =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        user,
      );
    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl.otpauthurl,
    );
  }

  @Post('turn-on/:id')
  // @HttpCode(200)
  // @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
    console.log('---- 2FA turn-on ----');
    console.log('---- data ----', data);
    const user = await this.userService.findOne(id);
    console.log('---- user ----', user);
    console.log('---- data.2fa ----', data.twoFactorAuthenticationCode);
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        data.twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      console.log('---- 2FA HERE ----');
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(user.id);
    const { accessToken } = await this.jwtAuthService.login(user, true);
    console.log('accessToken = ', accessToken);
    console.log('---- 2FA HERE ----');

    res.cookie('jwtToken', accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    // return accessToken;
    return res.status(200).json({ message: '2FA turned on' });
  }


  @Post('turn-off/:id')
  // @UseGuards(TwoFactorGuard)
  // @HttpCode(200)
  async turnOffTwoFactorAuthentication(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
    console.log('---- 2FA turn-off ----');
    const user = await this.userService.findOne(id);
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          data.twoFactorAuthenticationCode,
          user,
        );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOffTwoFactorAuthentication(user.id);
    const { accessToken } = await this.jwtAuthService.login(user, false);
    res.cookie('jwtToken', accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json({ message: '2FA turned off' });
    // return res.redirect('https://localhost:3000');
    // return res.status(200).json({ message: '2FA turned off' });
  }
  @Post('authenticate/:id')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(200)
  async authenticate(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
    console.log('---- 2FA authenticate ----');
    const user = await this.userService.findOne(id);
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        data.twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    /* TODO:
          create jwtToken cookie
          redirect to https://localhost:3000/main
    */


    const { accessToken } = await this.jwtAuthService.login(user, true);

    console.log('accessToken = ', accessToken);

    res.cookie('jwtToken', accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });

    return res.redirect('https://localhost:3000/');
  }
}
