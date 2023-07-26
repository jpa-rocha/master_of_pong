import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
  ) {}

  createChat(chatData: CreateChatDto) {
    const newChat = this.chatRepository.create(chatData);
    return this.chatRepository.save(newChat);
  }

  findAllChat() {
    return this.chatRepository.find();
  }

  async findDirectChat(user1: string, user2: string) {
    // after pressing on a friend in /chat it sends clientID and userID
    // to check if a chat entity containing them exists and returns it
    // maybe create the direct chat entity after accepting a friend request???
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'users')
      .where('users.id IN (:...usersIds)', { usersIds: [user1, user2] })
      .groupBy('chat.id')
      .having('COUNT(users.id) = 2')
      .getOne();

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
