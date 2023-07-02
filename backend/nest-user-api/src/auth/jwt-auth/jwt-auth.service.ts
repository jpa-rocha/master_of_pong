import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user) {
    const payload: JwtPayload = { username: user.username, forty_two_id: user.id };
    console.log("AT SIGN PAYLOAD")
    console.log(user.username)
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
