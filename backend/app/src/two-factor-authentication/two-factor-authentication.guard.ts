import { Global, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorStrategy } from './two-factor-authentication.strategy';

@Injectable()
@Global()
export default class TwoFactorGuard extends AuthGuard('two-factor') {
  constructor(private readonly twoFactorStrategy: TwoFactorStrategy) {
    super(twoFactorStrategy);
  }
}
