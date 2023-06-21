import { GameService } from './game.service';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    gameStatus(): void;
    startGame(): void;
    stopGame(): void;
    moveUpEnable(): void;
    moveUpDisable(): void;
    stopUp(): void;
    stopDown(): void;
    moveDown(): void;
    ultScorpion(): void;
    ultSubZero(): void;
    TimeWarp(): void;
    Mirage(): void;
    Freeze(): void;
    Lightning(): void;
    SoundGrenade(): void;
    BallSize(): void;
    ballReset(): void;
}
