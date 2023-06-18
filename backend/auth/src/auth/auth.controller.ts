import { Controller, Get, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from 'express';
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('signin')
    signin(@Req() request: Request) {
        return this.authService.signin(request)
    }
}
