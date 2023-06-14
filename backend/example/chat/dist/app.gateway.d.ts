import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AppService } from './app.service';
import { Chat } from './chat.entity';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private appService;
    arrowDown: number;
    arrowUp: number;
    pos_x: number;
    pos_y: number;
    constructor(appService: AppService);
    server: Server;
    handleSendMessage(client: Socket, payload: Chat): Promise<void>;
    handleSendEvent(client: Socket, data: unknown): Promise<void>;
    keyDownEvent(client: Socket, payload: String): void;
    keyUpEvent(client: Socket, payload: String): void;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
}
