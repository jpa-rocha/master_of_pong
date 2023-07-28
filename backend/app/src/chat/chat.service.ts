import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { FindOneOptions, OptionalUnlessRequiredId, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Message } from './entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { use } from 'passport';

interface ChatMessagesResult {
  chatID: number;
  messages: Message[];
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
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

  findOneChat(id: number) {
    const options: FindOneOptions<Chat> = {
      where: { id },
      relations: ['users'],
    };
    return this.chatRepository.findOne(options);
  }

  findOneChatTitle(title: string) {
    const options: FindOneOptions<Chat> = {
      where: { title: title },
    };
    return this.chatRepository.findOne(options);
  }

  async findDirectChat(user1ID: string, user2ID: string) {
    // after pressing on a friend in /chat it sends clientID and userID
    // to check if a chat entity containing them exists and returns it
    // maybe create the direct chat entity after accepting a friend request???
    console.log('findDirectChat HERE');
    const user1 = await this.usersService.findOne(user1ID);
    const user2 = await this.usersService.findOne(user2ID);
    if (!user1 || !user2) {
      throw new Error('user not found');
    }

    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.users', 'users1')
      .innerJoinAndSelect('chat.users', 'users2')
      .where('chat.channel = :channel', { channel: 'direct' })
      .andWhere('users1.id = :user1Id', { user1Id: user1.id })
      .andWhere('users2.id = :user2Id', { user2Id: user2.id })
      .getOne();

    console.log(chat);
    if (!chat) {
      console.log('------new chat created------');
      const chat = new Chat();
      chat.title = 'direct';
      chat.creator = user1;
      chat.channel = 'direct';
      chat.users = [user1, user2];
      return await this.chatRepository.save(chat);
    }
    return chat;
  }

  async createChatRoom(title: string, creatorID: string, password: string) {
    // 1: Check if the room name is available, if not inform the user
    console.log('1 HERE');
    if (await this.findOneChatTitle(title)) {
      return null;
    }
    console.log('2 HERE');

    // 2: If the name is available, create the chat room
    const creator = await this.usersService.findOne(creatorID);
    const chatRoom = new Chat();

    chatRoom.title = title;
    chatRoom.creator = creator;
    chatRoom.users = [creator];
    if (password) {
      chatRoom.channel = 'private';
      chatRoom.password = password;
    } else {
      chatRoom.channel = 'public';
      chatRoom.password = '';
    }
    console.log('3 HERE');
    return await this.chatRepository.save(chatRoom);
  }

  async getChatRooms(userID: string) {
    // Getting the private and public chat rooms that the user belogs to
    const chatRooms = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'user')
      .where('user.id = :userID', { userID })
      .andWhere('chat.channel != :channel', { channel: 'direct' })
      .getMany();
    return chatRooms;
  }

  async joinChatRoom(userID: string, chatID: number, password: string) {
    const chatRoom = await this.findOneChat(chatID);
    const user = await this.usersService.findOne(userID);
    if (chatRoom.channel === 'public') {
      chatRoom.users.push(user);
      return this.chatRepository.save(chatRoom);
    } else if (chatRoom.channel === 'private') {
      if (chatRoom.password === password) {
        chatRoom.users.push(user);
        return this.chatRepository.save(chatRoom);
      }
    }
    // failed to join chatRoom
    return null;
  }

  async getChatMessages(chatID: number): Promise<ChatMessagesResult> {
    /* 
        Think about a user that is blocked by another user.  
    */
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chat = :chatID', { chatID })
      .getMany();

    const result: ChatMessagesResult = {
      chatID: chatID,
      messages: messages,
    };

    return result;
  }

  async sendMessage(clientID: string, chatID: number, message: string) {
    /* 
          User sends a message to a chat and the message is saved in the database.
    */
    const newMessage = new Message();
    newMessage.chat = await this.findOneChat(chatID);
    newMessage.content = message;
    newMessage.sender = await this.usersService.findOne(clientID);
    return await this.messageRepository.save(newMessage);
  }

  updateChat(id: number, message: string, updateData: Partial<Chat>) {
    /* 
      Update the general information about a chat. eg. banned users, muted users, etc.
    */
    //  return this.chatRepository.update(id, updateDate);
  }
}
function getMany() {
  throw new Error('Function not implemented.');
}
