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
    console.log('secret -------------', secret);
    const CryptoJS = require('crypto-js');
    const hash = CryptoJS.AES.encrypt(
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
    const CryptoJS = require('crypto-js');
    const bytes = CryptoJS.AES.decrypt(
      user.twofa_secret,
      this.configService.get<string>('TWOFA_SECRET'),
    );
    const twofa_secret = await bytes.toString(CryptoJS.enc.Utf8);
    console.log('decrypted secret ------------------', twofa_secret);
    const verify = authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twofa_secret.trim(),
    });
    return verify;
  }
}
