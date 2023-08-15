import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthService } from './jwt-auth.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { Request } from 'express';

export type JwtPayload = {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private jwtAuthService: JwtAuthService,
  ) {
    // private usersService: UsersService) {
      // TODO could put token name in the .env?
    const extractJwtFromCookie = (req: Request) => {
      console.log('----- AT JWT-AUTH.STRATEGY -----');
      let token = null;
      if (req && req.headers.cookie) {
        let cookies = req.headers.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          let keyValuePairs = cookies[i].split('=');
          if (keyValuePairs.length === 2 && keyValuePairs[0].trim() === this.configService.get<string>('JWT_NAME')) {
              token = keyValuePairs[1];
              console.log('TOKEN =',token)
          }
        }
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
    console.log('----- AT VALIDATE JWT -----', token);
    const userInfo = await this.usersService.findOne(token.id);
    return userInfo;
  }
}
