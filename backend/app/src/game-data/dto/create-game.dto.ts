import { User } from 'src/users/entities/user.entity';

export class CreateGameDto {
  userOne: User;
  userTwo: User;
  winner: User;
  timestamp: Date;
}
