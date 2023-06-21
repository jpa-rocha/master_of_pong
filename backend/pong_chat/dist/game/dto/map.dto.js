"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
const common_1 = require("@nestjs/common");
let Map = exports.Map = class Map {
    constructor() {
        this.Width = 800;
        this.Height = 600;
        this.ballSize = 10;
        this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
        this.ballVel = { x: 5, y: -0.5 };
        this.ballVelOld = { x: 0, y: 0 };
        this.score = { p1: 0, p2: 0 };
        this.gameStarted = false;
        this.freeze = false;
        this.lightning = false;
        this.lightningDir = 0;
        this.ballPosTarget = 0;
        this.timeWarp = false;
        this.mirage = false;
        this.mirageBallsPos = [];
        this.mirageBallsVel = [];
    }
    default() {
        this.ballPos = { x: this.Width / 2, y: this.Height / 2 };
        this.ballVel = { x: 5, y: 0.5 };
        this.score = { p1: 0, p2: 0 };
        this.gameStarted = false;
    }
};
exports.Map = Map = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Map);
//# sourceMappingURL=map.dto.js.map