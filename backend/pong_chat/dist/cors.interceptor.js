"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsInterceptor = void 0;
const common_1 = require("@nestjs/common");
let CorsInterceptor = exports.CorsInterceptor = class CorsInterceptor {
    intercept(context, next) {
        const response = context.switchToHttp().getResponse();
        response.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        return next.handle();
    }
};
exports.CorsInterceptor = CorsInterceptor = __decorate([
    (0, common_1.Injectable)()
], CorsInterceptor);
//# sourceMappingURL=cors.interceptor.js.map