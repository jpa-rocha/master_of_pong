export class CreateUserDto {
  forty_two_id: number;
  username: string;
  refresh_token: string;
  email: string;
  avatar: string;
  is_2fa_enabled: boolean;
  twofa_secret: string;
  xp: number;
  status: string;
  socketID: string;
  wins: number;
  losses: number;
  rank: number;
  elo: number;
}
