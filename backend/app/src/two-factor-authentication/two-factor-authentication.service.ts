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
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret: string = authenticator.generateSecret();
    const otpauthurl = authenticator.keyuri(
      user.email,
      this.configService.get('POSTGRES_DB'),
      secret,
    );

    var CryptoJS = require('crypto-js');
    var hash = CryptoJS.AES.encrypt(
      secret,
      this.configService.get<string>('TWOFA_SECRET'),
    ).toString();
    await this.usersService.setTwoFactorAuthenticationSecret(hash, user.id);

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
    console.log('USER SECRET', user.twofa_secret);

    var CryptoJS = require('crypto-js');
    var bytes = CryptoJS.AES.decrypt(
      user.twofa_secret,
      this.configService.get<string>('TWOFA_SECRET'),
    );
    var twofa_secret = await bytes.toString(CryptoJS.enc.Utf8);

    const verify = authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twofa_secret,
    });
    console.log(verify);
    return verify;
  }
}
