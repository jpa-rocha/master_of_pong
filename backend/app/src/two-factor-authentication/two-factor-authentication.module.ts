import { Module } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { Friend } from 'src/users/entities/friend.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import { JwtAuthModule } from 'src/auth/jwt-auth/jwt-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from 'src/auth/jwt-auth/jwt-auth.strategy';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Friend]),
    ConfigModule,
    AuthModule,
    JwtAuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [
    TwoFactorAuthenticationService,
    UsersService,
    AuthService,
    JwtAuthService,
    JwtAuthStrategy,
  ],
  exports: [JwtModule, JwtAuthService],
})
export class TwoFactorAuthenticationModule {}
