import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthStrategy } from './jwt-auth.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtAuthStrategy: JwtAuthStrategy) {
    super(jwtAuthStrategy);
  }
}
