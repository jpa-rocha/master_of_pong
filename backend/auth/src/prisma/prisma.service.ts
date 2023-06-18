import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: "postgresql://admin:supersecret@localhost:5432/master_of_pong?schema=public"
                },
            },
        });
    }
}
