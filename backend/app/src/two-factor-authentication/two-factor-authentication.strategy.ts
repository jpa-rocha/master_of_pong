import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

export type JwtPayload = {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
};

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(
  Strategy,
  'two-factor',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const extractJwtFromCookie = (req: any) => {
      console.log('----- AT 2FA JWT-AUTH.STRATEGY -----');
      let token = null;
      if (req && req.cookies) {
        token = req.cookies[configService.get<string>('REACT_APP_JWT_NAME')];
      }
      console.log('TOKEN =', token);
      return token;
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(token: JwtPayload): Promise<User> {
    console.log('----- AT 2FA VALIDATE JWT -----', token);
    const userInfo = await this.usersService.findOne(token.id);
    if (token.is_2fa_enabled === true) {
      if (token.is_validated === false) {
        console.log('NO WAY!!!!!');
        return null;
      }
    }
    return userInfo;
  }
}
