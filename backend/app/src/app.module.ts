import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { Server } from 'socket.io';
import { GameDataModule } from './game-data/game-data.module';
import { ChatModule } from './chat/chat.module';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './two-factor-authentication/two-factor-authentication.controller';

@Module({
  imports: [
    GameModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: 5432,
        database: configService.get<string>('POSTGRES_DB'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    GameDataModule,
    ChatModule,
  ],
  controllers: [AppController, TwoFactorAuthenticationController],
  providers: [AppService, Server, TwoFactorAuthenticationService],
})
export class AppModule {}
