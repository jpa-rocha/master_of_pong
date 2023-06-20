import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
    imports: [
        ConfigModule.forRoot({
          isGlobal: true, // Make the configuration module available globally
        }),
      ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
