import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    database: 'user',
    username: 'user',
    password: 'password',
    host: 'localhost',
    port: 5432,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,

  }), UsersModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
