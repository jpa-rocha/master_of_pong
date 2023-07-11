import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from './jwt-auth/jwt-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async signin(user: AuthDto): Promise<string> {
    // const user: User = await this.usersService.findOne(user_dto.forty_two_id);

    console.log('AT SERVICE');
    console.log(user);
    const { accessToken } = this.jwtAuthService.login(user);
    // res.cookie('jwt', accessToken, {
    //   httpOnly: true,
    //   sameSite: 'lax',
    // });
    console.log(accessToken);
    // if (!user) return undefined;

    return accessToken;
  }
}
