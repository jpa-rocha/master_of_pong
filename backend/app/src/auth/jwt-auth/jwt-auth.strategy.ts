import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

export type JwtPayload = {
  id: string;
  is_2fa_enabled: boolean;
  is_validated: boolean;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // private usersService: UsersService) {
    const extractJwtFromCookie = (req) => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies['jwt'];
      }
      return token;
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // async validate(payload: JwtPayload) {
  //   console.log('AT VALIDATE JWT');
  //   const user = await this.usersService.findOne(payload.id)

  //   if (!user.is_2fa_enabled)
  //     return user

  //   if (payload.is_2fa_enabled)
  //     return user

  //   // return { id: payload.id};
  // }
}
