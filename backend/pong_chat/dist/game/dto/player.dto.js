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
exports.Player = void 0;
const common_1 = require("@nestjs/common");
let Player = exports.Player = class Player {
    constructor() {
        this.pos = { x: 10, y: 250 };
        this.height = 100;
        this.width = 20;
        this.speed = 10;
        this.getOverHere = false;
        this.freeze = false;
    }
    setValues(x, y, height, width, speed) {
        this.pos.x = x;
        this.pos.y = y;
        this.height = height;
        this.width = width;
        this.speed = speed;
    }
    resetPos(height) {
        this.pos.y = (height - this.height) / 2;
    }
};
exports.Player = Player = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], Player);
//# sourceMappingURL=player.dto.js.map