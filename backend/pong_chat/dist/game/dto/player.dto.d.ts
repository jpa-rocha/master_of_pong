export declare class Player {
    pos: {
        x: number;
        y: number;
    };
    height: number;
    width: number;
    speed: number;
    getOverHere: boolean;
    freeze: boolean;
    constructor();
    setValues(x: number, y: number, height: number, width: number, speed: number): void;
    resetPos(height: number): void;
}
