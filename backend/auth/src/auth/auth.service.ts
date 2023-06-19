import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { User } from '@prisma/client';


// Should be a strategy using passport
async function call_api(): Promise<any> {
    const url = ""
}

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    signin(request: Request) {
        const queries = request.query
        if (queries)
            return process.env.API_UID;
        else
            return "no queries"
    }
}
