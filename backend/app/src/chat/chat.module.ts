import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Friend } from 'src/users/entities/friend.entity';
import { Chat } from './entities/chat.entity';
import { ChatController } from './chat.controller';
import { Message } from './entities/message.entity';
import { GameData } from 'src/game-data/entities/game-data.entity';
import { GameCollection } from '../game/gameCollection';
import { GameDataService } from 'src/game-data/game-data.service';
// import { GameModule } from 'src/game/game.module';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import { GameDataModule } from 'src/game-data/game-data.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    // GameModule,
    GameDataModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Friend]),
    TypeOrmModule.forFeature([Chat]),
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([GameData]),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    UsersService,
    GameCollection,
    GameDataService,
    JwtAuthService,
    JwtService,
    ConfigService,
  ],
})
export class ChatModule {}
