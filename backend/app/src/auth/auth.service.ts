import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';
import { authenticator } from 'otplib';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtAuthService: JwtAuthService,
    private jwtService: JwtService,
  ) {}

  async signin(user: AuthDto): Promise<string> {
    // const user: User = await this.usersService.findOne(user_dto.forty_two_id);

    console.log('AT SERVICE');
    console.log(user);
    const { accessToken } = this.jwtAuthService.login(user);
    console.log(accessToken);
    // if (!user) return undefined;

    return accessToken;
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'master_of_pong',
      secret,
    );
    const updated_user: UpdateUserDto = {
      forty_two_id: user.forty_two_id,
      username: user.username,
      refresh_token: user.refresh_token,
      email: user.email,
      avatar: user.avatar,
      is_2fa_enabled: user.is_2fa_enabled,
      twofa_secret: secret,
      xp: user.xp,
    };
    await this.usersService.update(user.id, updated_user);

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(optAuthUrl: string) {
    return toDataURL(optAuthUrl);
  }

  isTwoFactorAuthenticationValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twofa_secret,
    });
  }

  async loginWithTwoFactorAuthentication(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      is_2fa_enabled: user.is_2fa_enabled,
      isTwoFactorAuthenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
