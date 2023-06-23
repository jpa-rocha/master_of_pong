export class Options {
  public gameMode: number;
  public paddle: number;
  public character: number;

  constructor(gamemode: number, paddle: number, character: number) {
    this.gameMode = gamemode;
    this.paddle = paddle;
    this.character = character;
  }
}
