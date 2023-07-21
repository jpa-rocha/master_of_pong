import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Friend } from 'src/users/entities/friend.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Friend])],
  providers: [ChatGateway, ChatService, UsersService]
})
export class ChatModule {}
