import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AppService } from './app.service';
import { Chat } from './chat.entity';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private appService;
    constructor(appService: AppService);
    server: Server;
    handleSendMessage(client: Socket, payload: Chat): Promise<void>;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
}
