import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class oauth2Guard extends AuthGuard('oauth2') {
  // handleRequest<User>(error: any, user: User): User {
  //   if (error || !user) {
  //     console.log({ error, user });
  //     throw new UnauthorizedException('OAuth guard failed.');
  //   }
  //   return user;
  // }
}
