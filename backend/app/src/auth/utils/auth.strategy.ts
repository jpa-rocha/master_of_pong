import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { User } from 'src/users/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { AuthDto } from '../dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
    private usersService: UsersService,
    private http: HttpService,
  ) {
    super({
      authorizationURL: configService.get<string>('API_URL'),
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: configService.get<string>('API_UID'),
      clientSecret: configService.get<string>('SECRET'),
      callbackURL: `${process.env.REACT_APP_BACKEND}/api/auth/redirect`,
      grant_type: 'authorization_code',
    });
  }

  async validate(accessToken: string): Promise<User> {
    const { data } = await this.http
      .get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();

    console.log('AT AUTH STRATEGY');

    if (data) {
      const user_dto: CreateUserDto = {
        forty_two_id: data.id,
        username: data.login,
        email: data.email,
        is_2fa_enabled: false,
        twofa_secret: null,
        refresh_token: accessToken,
        avatar: 'default-avatar.jpg',
        xp: 0,
        status: 'offline',
        socketID: null,
        wins: 0,
        losses: 0,
        rank: 0,
        elo: 1000,
      };

      let user: User = await this.usersService.findFortyTwo(
        user_dto.forty_two_id,
      );
      if (user === null) {
        await this.usersService.create(user_dto);
        // console.log({ user_dto: user_dto });
        user = await this.usersService.findFortyTwo(user_dto.forty_two_id);
        await this.usersService.recalculateRanks();
      } else {
        console.log('USER ALREADY EXISTS');
      }
      return user;
    }
  }
}
