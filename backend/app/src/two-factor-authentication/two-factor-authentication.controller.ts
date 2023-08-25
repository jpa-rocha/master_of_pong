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
import { ConfigService } from '@nestjs/config';


@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private readonly userService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly authService: AuthService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly configService: ConfigService
  ){};

  @Post('generate/:id')
  @UseGuards(JwtAuthGuard)
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
    return await this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl.otpauthurl,
    );
  }

  @Post('turn-on/:id')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
    const user = await this.userService.findOne(id);
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        data.twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const turnON = await this.userService.turnOnTwoFactorAuthentication(
      user.id,
    );
    const updatedUser = await this.userService.findOne(user.id);
    const { accessToken } = await this.jwtAuthService.login(updatedUser, true);

    res.cookie(this.configService.get<string>('REACT_APP_JWT_NAME'), accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json({ message: '2FA turned on' });
  }

  @Post('turn-off/:id')
  @UseGuards(TwoFactorGuard)
  async turnOffTwoFactorAuthentication(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
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
    const updatedUser = await this.userService.findOne(user.id);
    const { accessToken } = await this.jwtAuthService.login(updatedUser, false);
    res.cookie(this.configService.get<string>('REACT_APP_JWT_NAME'), accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json({ message: '2FA turned off' });
  }
  @Post('authenticate/:id')
  @UseGuards(JwtAuthGuard)
  // @HttpCode(200)
  async authenticate(
    @Req() request: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: { twoFactorAuthenticationCode: string },
  ) {
    const user = await this.userService.findOne(id);
    const isCodeValid =
      await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        data.twoFactorAuthenticationCode.trim(),
        user,
      );
      console.log("ISCODEVALID -------", isCodeValid)
    if (isCodeValid !== true) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const { accessToken } = await this.jwtAuthService.login(user, true);
    res.cookie(this.configService.get<string>('REACT_APP_JWT_NAME'), accessToken, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json({ message: '2FA code accepted' });
  }
}
