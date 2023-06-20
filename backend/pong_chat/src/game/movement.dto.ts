export class Options {
  public gameMode: string;
  public paddle: string;
  public character: string;

  constructor(gamemode: string, paddle: string, character: string) {
    this.gameMode = gamemode;
    this.paddle = paddle;
    this.character = character;
  }
}
