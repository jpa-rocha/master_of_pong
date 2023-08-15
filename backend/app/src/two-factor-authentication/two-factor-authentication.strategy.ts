import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthService } from '../auth/jwt-auth/jwt-auth.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

export type JwtPayload = {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
};

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private jwtAuthService: JwtAuthService,
  ) {
    // private usersService: UsersService) {
    const extractJwtFromCookie = (req: any) => {
      console.log('----- AT JWT-AUTH.STRATEGY -----');
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['jwtToken'];
      }
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
        return null;
      }
    }
    return userInfo;
  }
}
