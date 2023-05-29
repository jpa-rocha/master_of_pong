import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    Home(): {
        message: string;
    };
    Chat(res: any): Promise<void>;
    Game(res: any): Promise<void>;
}
