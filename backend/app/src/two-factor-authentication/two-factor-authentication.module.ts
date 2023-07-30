import { Module } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { ConfigModule } from '@nestjs/config';
import { Friend } from 'src/users/entities/friend.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Friend]),
    ConfigModule,
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService, UsersService],
})
export class TwoFactorAuthenticationModule {}
