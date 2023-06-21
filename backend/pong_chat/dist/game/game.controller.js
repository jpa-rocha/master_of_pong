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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
let GameController = exports.GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    gameStatus() {
        this.gameService.gameStatus();
    }
    startGame() {
        this.gameService.startGame();
    }
    stopGame() {
        this.gameService.stopGame();
    }
    moveUpEnable() {
        this.gameService.moveUp();
    }
    moveUpDisable() {
        this.gameService.moveUp();
    }
    stopUp() {
        this.gameService.stopUp();
    }
    stopDown() {
        this.gameService.stopDown();
    }
    moveDown() {
        this.gameService.moveDown();
    }
    ultScorpion() {
        this.gameService.ultScorpion();
    }
    ultSubZero() {
        this.gameService.ultSubZero();
    }
    TimeWarp() {
        this.gameService.abTimeWarp();
    }
    Mirage() {
        this.gameService.abMirage();
    }
    Freeze() {
        this.gameService.abFreeze();
    }
    Lightning() {
        this.gameService.abLightning();
    }
    SoundGrenade() {
        this.gameService.SoundGrenade();
    }
    BallSize() {
        this.gameService.BallSize();
    }
    ballReset() {
        this.gameService.ballReset();
    }
};
__decorate([
    (0, common_1.Get)('gameStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "gameStatus", null);
__decorate([
    (0, common_1.Post)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "startGame", null);
__decorate([
    (0, common_1.Post)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "stopGame", null);
__decorate([
    (0, common_1.Post)('move/up/enable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "moveUpEnable", null);
__decorate([
    (0, common_1.Post)('move/up/disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "moveUpDisable", null);
__decorate([
    (0, common_1.Post)('move/stopup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "stopUp", null);
__decorate([
    (0, common_1.Post)('move/stopdown'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "stopDown", null);
__decorate([
    (0, common_1.Post)('move/down'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "moveDown", null);
__decorate([
    (0, common_1.Post)('ultScorpion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "ultScorpion", null);
__decorate([
    (0, common_1.Post)('ultSubZero'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "ultSubZero", null);
__decorate([
    (0, common_1.Post)('ability/timewarp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "TimeWarp", null);
__decorate([
    (0, common_1.Post)('ability/mirage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "Mirage", null);
__decorate([
    (0, common_1.Post)('ability/freeze'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "Freeze", null);
__decorate([
    (0, common_1.Post)('ability/lightning'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "Lightning", null);
__decorate([
    (0, common_1.Post)('ability/soundgrenade'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "SoundGrenade", null);
__decorate([
    (0, common_1.Post)('ability/ballsize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "BallSize", null);
__decorate([
    (0, common_1.Post)('ability/ballreset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameController.prototype, "ballReset", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map