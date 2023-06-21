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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_gateway_1 = require("./game.gateway");
const map_dto_1 = require("./dto/map.dto");
const player_dto_1 = require("./dto/player.dto");
let GameService = exports.GameService = class GameService {
    constructor(gameGateway, map, player1, player2) {
        this.gameGateway = gameGateway;
        this.map = map;
        this.player1 = player1;
        this.player2 = player2;
        this.ballTimer = null;
        this.botTimer = null;
        this.moveUpTimer = null;
        this.moveDownTimer = null;
        this.pressUp = 0;
        this.pressDown = 0;
        this.freezeBot = false;
        this.szTimer = null;
        this.timeWarpTimer = null;
        this.mirageTimer = null;
        this.freezeTimer = null;
    }
    gameStatus() {
        this.gameGateway.server.emit('gameStatus', {
            gameStatus: this.map.gameStarted,
        });
    }
    startGame() {
        if (this.map.gameStarted == true) {
            console.log('The game was already started');
            return;
        }
        this.map.gameStarted = true;
        this.player1.setValues(10, 250, 100, 20, 5);
        this.player2.setValues(770, 250, 100, 20, 1);
        this.gameGateway.server.emit('winnerUpdate', {
            winner: '',
        });
        if (this.ballTimer || this.botTimer)
            return;
        this.ballTimer = setInterval(() => {
            this.moveBall();
        }, 10);
        this.botTimer = setInterval(() => {
            this.moveBot();
        }, 1);
    }
    stopGame() {
        if (this.map.gameStarted == false) {
            console.log('Can not end the game, it has not started yet');
            return;
        }
        if (this.ballTimer) {
            clearInterval(this.ballTimer);
            this.ballTimer = null;
        }
        if (this.botTimer) {
            clearInterval(this.botTimer);
            this.botTimer = null;
        }
        if (this.map.score.p1 == 11) {
            this.gameGateway.server.emit('winnerUpdate', {
                winner: 'Player1 wins',
            });
        }
        else if (this.map.score.p2 == 11) {
            this.gameGateway.server.emit('winnerUpdate', {
                winner: 'Player2 wins',
            });
        }
        this.map.default();
        this.player1.resetPos(this.map.Height);
        this.player2.resetPos(this.map.Height);
        this.gameGateway.server.emit('player1Update', {
            player1: this.player1.pos.y,
        });
        this.gameGateway.server.emit('player2Update', {
            player2: this.player2.pos.y,
        });
        this.gameGateway.server.emit('ballUpdate', {
            ball: this.map.ballPos,
        });
        this.gameGateway.server.emit('scoreUpdate', {
            score: this.map.score,
        });
        this.gameGateway.server.emit('gameStatus', {
            gameStatus: this.map.gameStarted,
        });
    }
    moveUpEnable() {
        if (this.moveUpTimer)
            return;
        this.moveUpTimer = setInterval(() => {
            this.moveUp();
        }, 0.1);
    }
    moveUpDisable() {
        if (this.moveUpTimer) {
            clearInterval(this.moveUpTimer);
            this.moveUpTimer = null;
        }
    }
    moveUp() {
        if (this.map.gameStarted == false)
            return;
        this.pressUp = 1;
    }
    stopUp() {
        if (this.map.gameStarted == false)
            return;
        this.pressUp = 0;
    }
    moveDown() {
        if (this.map.gameStarted == false)
            return;
        this.pressDown = 1;
    }
    stopDown() {
        if (this.map.gameStarted == false)
            return;
        this.pressDown = 0;
    }
    ultScorpion() {
        this.player1.getOverHere = true;
    }
    abTimeWarp() {
        this.map.timeWarp = true;
    }
    ultSubZero() {
        this.map.freeze = true;
        this.gameGateway.server.emit('ultimateSubZero', {
            ultimate: true,
        });
    }
    abFreeze() {
        this.player1.freeze = true;
        this.gameGateway.server.emit('freeze', {
            freeze: true,
        });
    }
    abLightning() {
        this.map.lightning = true;
        this.gameGateway.server.emit('lightning', {
            lightning: true,
        });
    }
    abMirage() {
        this.map.mirage = true;
        this.gameGateway.server.emit('mirage', {
            mirage: true,
        });
    }
    SoundGrenade() {
        this.gameGateway.server.emit('SoundGrenade', {
            player2: this.player2.pos.y,
        });
    }
    BallSize() {
        this.map.ballSize *= 2;
        this.gameGateway.server.emit('BallSize', {
            ballSize: this.map.ballSize,
        });
        setTimeout(() => {
            this.map.ballSize /= 2;
            this.gameGateway.server.emit('BallSize', {
                ballSize: this.map.ballSize,
            });
        }, 10000);
    }
    ballReset() {
        this.map.ballSize = 10;
        this.gameGateway.server.emit('BallSize', {
            ballSize: this.map.ballSize,
        });
    }
    moveBot() {
        if (this.map.gameStarted == false || this.freezeBot)
            return;
        if (this.map.ballPos.y > this.player2.pos.y + this.player2.height / 2)
            this.player2.pos.y += this.player2.speed;
        if (this.map.ballPos.y < this.player2.pos.y + this.player2.height / 2)
            this.player2.pos.y -= this.player2.speed;
        if (this.player2.pos.y < 0)
            this.player2.pos.y = 0;
        if (this.player2.pos.y > this.map.Height - this.player2.height)
            this.player2.pos.y = this.map.Height - this.player2.height;
        this.gameGateway.server.emit('player2Update', {
            player2: this.player2.pos.y,
        });
    }
    revertBallSpeed(ballVelX, ballVelY) {
        this.map.ballVel.x = ballVelX;
        this.map.ballVel.y = ballVelY;
    }
    ball_line_interaction(line_x, line_y) {
        const y_pos = this.map.ballPos.y +
            Math.sqrt(this.map.ballSize ** 2 - (line_x - this.map.ballPos.x) ** 2);
        const y_neg = this.map.ballPos.y -
            Math.sqrt(this.map.ballSize ** 2 - (line_x - this.map.ballPos.x) ** 2);
        if (y_pos < line_y.max && y_pos > line_y.min)
            return true;
        if (y_neg < line_y.max && y_neg > line_y.min)
            return true;
        return false;
    }
    moveBall() {
        if (this.map.gameStarted == false)
            return;
        if (this.map.lightning) {
            if (this.map.lightningDir === 0) {
                if (this.map.ballVel.x < 0) {
                    this.map.lightningDir = -1;
                }
                else {
                    this.map.lightningDir = 1;
                }
                this.map.ballVel.y =
                    (Math.abs(this.map.ballVel.y) + Math.abs(this.map.ballVel.x)) * 2;
                this.map.ballVel.x = 0;
                if (this.map.ballPos.y > 300) {
                    this.map.ballVel.y = -this.map.ballVel.y;
                    this.map.ballPosTarget = this.map.ballPos.y - 250;
                }
                else {
                    this.map.ballPosTarget = this.map.ballPos.y + 250;
                }
            }
            if ((this.map.ballVel.y >= 0 &&
                this.map.ballPos.y >= this.map.ballPosTarget) ||
                (this.map.ballVel.y < 0 && this.map.ballPos.y <= this.map.ballPosTarget)) {
                this.map.lightning = false;
                const hypotenuse = 5;
                this.map.ballVel.y = -this.map.ballVel.y / 4;
                if (this.map.lightningDir < 0) {
                    this.map.ballVel.x = -Math.sqrt(hypotenuse ** 2 - this.map.ballVel.y ** 2);
                }
                else
                    this.map.ballVel.x = Math.sqrt(hypotenuse ** 2 + this.map.ballVel.y ** 2);
                setTimeout(() => {
                    this.gameGateway.server.emit('lightning', {
                        lightning: false,
                    });
                    const lengthNew = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
                    const scaleFactor = 5 / lengthNew;
                    this.map.ballVel.x *= scaleFactor;
                    this.map.ballVel.y *= scaleFactor;
                }, 800);
                this.map.lightningDir = 0;
            }
        }
        if (this.map.timeWarp == true) {
            if (this.timeWarpTimer) {
                clearTimeout(this.szTimer);
                this.szTimer = null;
            }
            else {
                this.map.ballVel.x = -this.map.ballVel.x;
                this.map.ballVel.y = -this.map.ballVel.y;
            }
            this.map.timeWarp = false;
            this.timeWarpTimer = setTimeout(() => {
                this.map.ballVel.x = -this.map.ballVel.x;
                this.map.ballVel.y = -this.map.ballVel.y;
                this.timeWarpTimer = null;
            }, 3000);
        }
        if (!this.player1.freeze) {
            if (this.pressUp == 1) {
                this.player1.pos.y -= this.player1.speed;
                if (this.player1.pos.y < 0)
                    this.player1.pos.y = 0;
            }
            if (this.pressDown == 1) {
                this.player1.pos.y += this.player1.speed;
                if (this.player1.pos.y > this.map.Height - this.player1.height)
                    this.player1.pos.y = this.map.Height - this.player1.height;
            }
        }
        else {
            if (!this.freezeTimer) {
                this.freezeTimer = setTimeout(() => {
                    this.player1.freeze = false;
                    this.freezeTimer = null;
                    this.gameGateway.server.emit('freeze', {
                        freeze: true,
                    });
                }, 1200);
            }
        }
        if (this.map.freeze == true) {
            if (this.szTimer) {
                clearTimeout(this.szTimer);
            }
            else {
                this.map.ballVelOld.x = this.map.ballVel.x;
                this.map.ballVelOld.y = this.map.ballVel.y;
                this.map.ballVel.x = 0;
                this.map.ballVel.y = 0;
            }
            this.map.freeze = false;
            this.szTimer = setTimeout(() => {
                this.map.ballVel.x = this.map.ballVelOld.x;
                this.map.ballVel.y = this.map.ballVelOld.y;
                this.gameGateway.server.emit('ultimateSubZero', {
                    ultimate: false,
                });
                this.szTimer = null;
            }, 1200);
        }
        if (this.player1.getOverHere == true) {
            const speed = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
            const target = {
                x: this.player1.pos.x + this.player1.width,
                y: this.player1.pos.y + this.player1.height / 2,
            };
            const targetVector = {
                x: target.x - this.map.ballPos.x,
                y: target.y - this.map.ballPos.y,
            };
            const magnitude = Math.sqrt(targetVector.x ** 2 + targetVector.y ** 2);
            targetVector.x = (targetVector.x / magnitude) * speed;
            targetVector.y = (targetVector.y / magnitude) * speed;
            this.map.ballVel = targetVector;
        }
        this.map.ballPos.x += this.map.ballVel.x;
        this.map.ballPos.y += this.map.ballVel.y;
        if (this.map.mirage) {
            this.map.mirage = false;
            if (this.mirageTimer) {
                clearTimeout(this.mirageTimer);
            }
            let index = 0;
            while (index < 8) {
                this.map.mirageBallsPos.push([
                    this.map.ballPos.x + (Math.random() - 0.5) * 10,
                    this.map.ballPos.y + (Math.random() - 0.5) * 10,
                ]);
                this.map.mirageBallsVel.push([
                    this.map.ballVel.x + (Math.random() - 0.5) * 2,
                    this.map.ballVel.y + (Math.random() - 0.5) * 2,
                ]);
                index++;
            }
            this.mirageTimer = setTimeout(() => {
                this.gameGateway.server.emit('mirage', {
                    mirage: false,
                });
                this.mirageTimer = null;
                this.map.mirageBallsPos = [];
                this.map.mirageBallsVel = [];
            }, 5000);
        }
        if (this.map.ballPos.x >= this.map.Width || this.map.ballPos.x <= 0) {
            if (this.map.ballPos.x >= this.map.Width)
                this.map.score.p1 += 1;
            if (this.map.ballPos.x <= 0)
                this.map.score.p2 += 1;
            if (this.map.score.p1 == 11 || this.map.score.p2 == 11)
                this.stopGame();
            this.map.ballPos.x = this.map.Width / 2;
            this.map.ballPos.y = this.map.Height / 2;
            this.map.ballVel.y = -0.5;
            this.map.ballVel.x = 5;
        }
        if ((this.map.ballPos.y + this.map.ballSize >= this.map.Height &&
            this.map.ballVel.y > 0) ||
            (this.map.ballPos.y - this.map.ballSize <= 0 && this.map.ballVel.y < 0)) {
            this.map.ballVel.y = this.map.ballVel.y * -1;
        }
        if (this.map.ballVel.x <= 0 &&
            this.ball_line_interaction(this.player1.pos.x + this.player1.width, {
                max: this.player1.pos.y + this.player1.height,
                min: this.player1.pos.y,
            })) {
            const lengthOld = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
            const maxChange = 0.5;
            let change = this.map.ballPos.y - (this.player1.pos.y + this.player1.height / 2);
            if (Math.abs(change) > maxChange) {
                if (change > 0)
                    change = maxChange;
                else
                    change = maxChange * -1;
            }
            this.map.ballVel.x = this.map.ballVel.x * -1;
            this.map.ballVel.y += change;
            this.player1.getOverHere = false;
            this.map.freeze = false;
            const lengthNew = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
            const scaleFactor = lengthOld / lengthNew;
            this.map.ballVel.x *= scaleFactor;
            this.map.ballVel.y *= scaleFactor;
        }
        if (this.map.ballVel.x >= 0 &&
            this.ball_line_interaction(this.player2.pos.x, {
                max: this.player2.pos.y + this.player2.height,
                min: this.player2.pos.y,
            })) {
            const lengthOld = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
            const maxChange = 0.5;
            let change = this.map.ballPos.y - (this.player2.pos.y + this.player2.height / 2);
            if (Math.abs(change) > maxChange) {
                if (change > 0)
                    change = maxChange;
                else
                    change = maxChange * -1;
            }
            this.map.ballVel.x = this.map.ballVel.x * -1;
            this.map.ballVel.y += change;
            const lengthNew = Math.sqrt(this.map.ballVel.x ** 2 + this.map.ballVel.y ** 2);
            const scaleFactor = lengthOld / lengthNew;
            this.map.ballVel.x *= scaleFactor;
            this.map.ballVel.y *= scaleFactor;
        }
        if (this.mirageTimer) {
            let i;
            for (i in this.map.mirageBallsPos) {
                this.map.mirageBallsPos[i][0] += this.map.mirageBallsVel[i][0];
                this.map.mirageBallsPos[i][1] += this.map.mirageBallsVel[i][1];
                if (this.map.mirageBallsPos[i][1] + this.map.ballSize >=
                    this.map.Height ||
                    this.map.mirageBallsPos[i][1] - this.map.ballSize <= 0) {
                    this.map.mirageBallsVel[i][1] = this.map.mirageBallsVel[i][1] * -1;
                }
                if (this.map.mirageBallsPos[i][0] + this.map.ballSize >= this.map.Width ||
                    this.map.mirageBallsPos[i][0] - this.map.ballSize <= 0) {
                    this.map.mirageBallsVel[i][0] = this.map.mirageBallsVel[i][0] * -1;
                }
            }
            this.gameGateway.server.emit('mirageUpdate', {
                mirageUpdate: this.map.mirageBallsPos,
            });
        }
        this.gameGateway.server.emit('player1Update', {
            player1: this.player1.pos.y,
        });
        this.gameGateway.server.emit('ballUpdate', {
            ball: this.map.ballPos,
        });
        this.gameGateway.server.emit('scoreUpdate', {
            score: this.map.score,
        });
        this.gameGateway.server.emit('ultimateUpdate', {
            ultimate: this.player1.getOverHere,
        });
    }
};
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('Map')),
    __param(2, (0, common_1.Inject)('Player1')),
    __param(3, (0, common_1.Inject)('Player2')),
    __metadata("design:paramtypes", [game_gateway_1.GameGateway,
        map_dto_1.Map,
        player_dto_1.Player,
        player_dto_1.Player])
], GameService);
//# sourceMappingURL=game.service.js.map