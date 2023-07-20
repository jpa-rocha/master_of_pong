import { Injectable } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';
import { identity } from 'rxjs';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user) {
    const payload: JwtPayload = {
      id: user.id,
      is_2fa_enabled: user.is_2fa_enabled,
    };
    console.log('AT SIGN PAYLOAD');
    console.log(user.username);
    return {
      accessToken: this.jwtService.sign(payload),
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
