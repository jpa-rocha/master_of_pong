import { Injectable} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Request } from 'express';
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    signin(request: Request) {
        const queries = request.query
        return queries
    }
}
