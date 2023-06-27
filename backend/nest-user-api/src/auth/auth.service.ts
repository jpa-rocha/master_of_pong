import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(user_dto: AuthDto): Promise<User> {
    const user: User = await this.usersService.findOne(user_dto.forty_two_id);

    if (!user) return undefined;

    return user;
  }
}
