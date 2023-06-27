export class Options {
  public gameMode: number;
  public paddle: number;
  public character: number;
  public hyper: boolean;

  constructor(
    gamemode: number,
    paddle: number,
    character: number,
    hyper: boolean,
  ) {
    this.gameMode = gamemode;
    this.paddle = paddle;
    this.character = character;
    this.hyper = hyper;
  }
}
