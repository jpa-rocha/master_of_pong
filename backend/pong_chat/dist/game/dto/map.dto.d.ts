export declare class Map {
    Width: number;
    Height: number;
    ballSize: number;
    ballPos: {
        x: number;
        y: number;
    };
    ballPosTarget: number;
    ballVel: {
        x: number;
        y: number;
    };
    ballVelOld: {
        x: number;
        y: number;
    };
    score: {
        p1: number;
        p2: number;
    };
    gameStarted: boolean;
    freeze: boolean;
    lightning: boolean;
    lightningDir: number;
    timeWarp: boolean;
    mirage: boolean;
    mirageBallsPos: number[][];
    mirageBallsVel: number[][];
    constructor();
    default(): void;
}
