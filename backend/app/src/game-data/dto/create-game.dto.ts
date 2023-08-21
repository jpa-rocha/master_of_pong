import { User } from 'src/users/entities/user.entity';

export class CreateGameDto {
  userOne: User;
  userTwo: User;
  winner: User;
  timestamp: Date;
  gameMode: string;
  gameModeOptions: string;
  score1: number;
  score2: number;
}
