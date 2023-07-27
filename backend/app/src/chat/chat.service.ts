import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private usersService: UsersService,
  ) {}

  createChat(chatData: CreateChatDto) {
    const newChat = this.chatRepository.create(chatData);
    return this.chatRepository.save(newChat);
  }

  saveChat(newChat: Chat) {
    return this.chatRepository.save(newChat);
  }

  findAllChat() {
    return this.chatRepository.find();
  }

  async findDirectChat(user1ID: string, user2ID: string) {
    // after pressing on a friend in /chat it sends clientID and userID
    // to check if a chat entity containing them exists and returns it
    // maybe create the direct chat entity after accepting a friend request???
    console.log('findDirectChat HERE');
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.users', 'users')
      .where('chat.channel = :channel', { channel: 'direct' })
      .getOne();

    if (!chat) {
      console.log('------new chat created------');
      const user1 = await this.usersService.findOne(user1ID);
      const user2 = await this.usersService.findOne(user2ID);
      if (!user1 || !user2) {
        throw new Error('user not found');
      }
      const chat = new Chat();
      chat.creator = user1;
      chat.channel = 'direct';
      chat.users = [user1, user2];
      return await this.chatRepository.save(chat);
    }
    return chat;
  }

  getChatMessages(chatID: number) {
    /* 
        Think about a user that is blocked by another user.  
    */
  }

  sendMessage(clientID: number, message: string) {
    /* 
      User sends a message to a chat and the message is saved in the database.
    */
  }

  updateChat(id: number, message: string, updateData: Partial<Chat>) {
    /* 
      Update the general information about a chat. eg. banned users, muted users, etc.
    */
  }
}
