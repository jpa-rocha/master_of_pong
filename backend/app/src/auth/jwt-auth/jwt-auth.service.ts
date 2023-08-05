import { Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';
import { identity } from 'rxjs';
import { ConfigService } from '@nestjs/config';
// import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(user, validated: boolean) {
    const payload: JwtPayload = {
      id: user.id,
      is_2fa_enabled: user.is_2fa_enabled,
      is_validated: validated,
    };

    const Token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    console.log('----- AFTER SIGN -----');
    console.log('----- Token -----', Token);
    return {
      accessToken: Token,
    };
  }

  getTokenInformation(token: string) {
    const decodedToken = this.jwtService.decode(token) as { id?: string };
    const decodedId = decodedToken?.id;
    return decodedId;
  }

  verifyToken(token: string, secret: string): boolean {
    try {
      const verifyOptions: JwtVerifyOptions = {
        secret: secret,
      };
      this.jwtService.verify(token, verifyOptions);
      return true;
    } catch (error) {
      return false;
    }
  }
}
