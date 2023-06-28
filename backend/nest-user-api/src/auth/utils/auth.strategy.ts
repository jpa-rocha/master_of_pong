import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { User } from 'src/users/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { AuthDto } from '../dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {

  constructor(private readonly configService: ConfigService,
              private authService: AuthService,
              private http: HttpService) {super({
      authorizationURL:
        '--> secret here', //TODO: add secret
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID:configService.get<string>('API_UID'),
      clientSecret: configService.get<string>('SECRET'),
      callbackURL: 'http://localhost:3001/api/auth/redirect',
      grant_type: 'authorization_code',
    });
  }

  async validate(accessToken: string): Promise<User> {
    console.log({ 'access Token': accessToken });
    const { data } = await this.http
      .get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();

    console.log({ data: data }); // This is the data from the 42 API
    const user: User = await this.authService.login(data.id);

    if (user) return user;

    const user_dto: AuthDto = {
      forty_two_id: data.id,
      username: data.login,
      email: data.email,
    };

    return data;
  }
}
