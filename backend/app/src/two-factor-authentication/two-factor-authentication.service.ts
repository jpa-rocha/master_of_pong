import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ){};

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret: string = authenticator.generateSecret();
    const otpauthurl = authenticator.keyuri(
      user.email,
      this.configService.get('POSTGRES_DB'),
      secret,
    )
    console.log('SECRET', secret);
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthurl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return await toFileStream(stream, otpauthUrl);
  }

  public async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    console.log('USER SECRET', user.twofa_secret)
    const verify = authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twofa_secret,
    });
    console.log(verify)
    return verify;
  }
}
