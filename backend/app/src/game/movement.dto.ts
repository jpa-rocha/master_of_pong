export class Options {
  public gameMode: number;
  public paddle: number;
  public character: number;
  public hyper: boolean;
  public dodge: boolean;

  constructor(
    gamemode: number,
    paddle: number,
    character: number,
    hyper: boolean,
    dodge: boolean,
  ) {
    this.gameMode = gamemode;
    this.paddle = paddle;
    this.character = character;
    this.hyper = hyper;
    this.dodge = dodge;
  }
}
