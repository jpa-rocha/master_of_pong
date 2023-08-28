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
    const trimSecret = secret.trim()
    const otpauthurl = authenticator.keyuri(
      user.email,
      this.configService.get('POSTGRES_DB'),
      trimSecret,
    );
    const CryptoJS = require('crypto-js');
    const hash = CryptoJS.AES.encrypt(
      trimSecret,
      this.configService.get<string>('TWOFA_SECRET'),
    ).toString();
    await this.usersService.setTwoFactorAuthenticationSecret(hash, user.id);

    return {
      trimSecret,
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
    const CryptoJS = require('crypto-js');
    const bytes = CryptoJS.AES.decrypt(
      user.twofa_secret,
      this.configService.get<string>('TWOFA_SECRET'),
    );
    const twofa_secret = await bytes.toString(CryptoJS.enc.Utf8);
    let trimSecret = twofa_secret.trim()
    const verify = authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: trimSecret,
    });
    return verify;
  }
}
