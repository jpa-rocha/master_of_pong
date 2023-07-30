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
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Console } from 'console';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly userService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  @Get('generate/:id')
  //   @UseGuards(JwtAuthGuard)
  async register(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    // get user from cookie
    console.log('AT 2FA CONTROLLER');
    const user = await this.userService.findOne(id);
    console.log('User = ', user);
    const otpauthUrl =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        user,
      );
    console.log('otpauthUrl secret = ', otpauthUrl.secret);
    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl.otpauthurl,
    );
  }

  @Post('turn-on/:id')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() twoFactorAuthenticationCode: string,
  ) {
    const user = await this.userService.findOne(id);
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user,
      );
    if (isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(user.id);
  }
}
