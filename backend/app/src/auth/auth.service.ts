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
    console.log(user.is_2fa_enabled);
    // if (user.is_2fa_enabled) {
    //   console.log('2FA ENABLED');
    // }
    const { accessToken } = this.jwtAuthService.login(user);
    console.log(accessToken);
    // if (!user) return undefined;

    return accessToken;
  }

  /*   
  public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getById(payload.userId);
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
  */
}
