import {
    ClassSerializerInterceptor,
    Controller,
    Header,
    Post,
    UseInterceptors,
    Res,
    UseGuards,
    Req,
  } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
    constructor (
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService
        ) {}


        @Post('generate')
        @UseGuards(JwtAuthGuard)
        async register(@Res() response: Response, @Req() request: Request) {
            const  {otpauthUrl} = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.cookies)

            return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
        }
}
