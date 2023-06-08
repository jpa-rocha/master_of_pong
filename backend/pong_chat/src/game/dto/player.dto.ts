export class Player {
  public x: number;
  public y: number;
  public height: number;
  public width: number;
  public speed: number;

  constructor(
    x: number,
    y: number,
    height: number,
    width: number,
    speed: number,
  ) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.speed = speed;
  }

  public init(
    x: number,
    y: number,
    height: number,
    width: number,
    speed: number,
  ): void {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.speed = speed;
  }
}
