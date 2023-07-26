import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Friend]),
    TypeOrmModule.forFeature([Chat]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
