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
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const app_service_1 = require("./app.service");
const chat_entity_1 = require("./chat.entity");
let AppGateway = class AppGateway {
    constructor(appService) {
        this.appService = appService;
        this.arrowDown = 0;
        this.arrowUp = 0;
        this.pos_x = 778;
        this.pos_y = 25;
    }
    async handleSendMessage(client, payload) {
        await this.appService.createMessage(payload);
        this.server.emit('recMessage', payload);
    }
    async handleSendEvent(client, data) {
    }
    keyDownEvent(client, payload) {
        if (payload === 'ArrowDown')
            this.arrowDown = 1;
        if (payload === 'ArrowUp')
            this.arrowUp = 1;
    }
    keyUpEvent(client, payload) {
        if (payload === 'ArrowDown')
            this.arrowDown = 0;
        if (payload === 'ArrowUp')
            this.arrowUp = 0;
    }
    afterInit(server) {
        console.log(server);
    }
    handleDisconnect(client) {
        console.log(`Disconnected: ${client.id}`);
    }
    handleConnection(client, ...args) {
        console.log(`Connected ${client.id}`);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, chat_entity_1.Chat]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendEvent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleSendEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('keydown'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "keyDownEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('keyup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "keyUpEvent", null);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map