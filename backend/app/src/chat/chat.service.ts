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
import { title } from 'process';

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
      relations: ['users', 'creator', 'admins'],
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
    // console.log('findDirectChat HERE');
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

    // console.log(chat);
    if (!chat) {
      // console.log('------new chat created------');
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
    if (await this.findOneChatTitle(title)) {
      return null;
    }

    // 2: If the name is available, create the chat room
    const creator = await this.usersService.findOne(creatorID);
    const chatRoom = new Chat();

    chatRoom.title = title;
    chatRoom.creator = creator;
    chatRoom.users = [creator];
    chatRoom.admins = [creator];
    if (password) {
      chatRoom.channel = 'private';
      chatRoom.password = password;
    } else {
      chatRoom.channel = 'public';
      chatRoom.password = '';
    }
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
      // TODO seems like a really unsafe way of handling passwords
      if (chatRoom.password === password) {
        chatRoom.users.push(user);
        return this.chatRepository.save(chatRoom);
      }
    }
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
      .orderBy('message.timestamp', 'ASC')
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

  async checkName(title: string) {
    if (await this.findOneChatTitle(title)) return false;
    return true;
  }

  async checkPassword(id: number, password: string) {
    const chat = await this.findOneChat(id);
    if (chat.password == password) return true;
    return false;
  }

  async getChatRoomsJoin(userID: string, name: string) {
    const subQuery = this.chatRepository
      .createQueryBuilder('chatSub')
      .innerJoin('chatSub.users', 'userSub')
      .where('userSub.id = :userID') // Remove the parameter here
      .select('chatSub.id') // Select only the chatSub.id column
      .getQuery();

    const chatRooms = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.channel != :channel', { channel: 'direct' })
      .andWhere('chat.title LIKE :name', { name: `${name}%` })
      .setParameter('userID', userID) // Set the parameter here
      .andWhere(`chat.id NOT IN (${subQuery})`)
      .getMany();

    return chatRooms;
  }

  async addAdmin(senderID: string, adminID: string, chatID: number) {
    const chat = await this.findOneChat(chatID);
    if (chat.creator.id !== senderID) return null;
    const admin = await this.usersService.findOne(adminID);
    if (admin) {
      chat.admins.push(admin);
      return this.chatRepository.save(chat);
    }
    return null;
  }

  async removeAdmin(senderID: string, adminID: string, chatID: number) {
    const chat = await this.findOneChat(chatID);
    if (chat.creator.id !== senderID) return null;
    const admin = chat.admins.findIndex((admin) => admin.id === adminID);
    if (admin !== -1) {
      chat.admins.splice(admin, 1);
      return this.chatRepository.save(chat);
    }
    return null;
  }

  async leaveChat(userID: string, chatID: number) {
    console.log('LEAVE CHAT');
    const chat = await this.findOneChat(chatID);
    const indexUsers = chat.users.findIndex((user) => user.id === userID);
    const indexAdmins = chat.admins.findIndex((user) => user.id === userID);
    if (indexAdmins !== -1) chat.admins.splice(indexAdmins, 1);
    if (indexUsers !== -1) chat.users.splice(indexUsers, 1);
    if (chat.creator.id === userID) {
      if (chat.admins.length > 0) chat.creator = chat.admins[0];
      else if (chat.users.length > 0) chat.creator = chat.users[0];
      else {
        console.log('NEW OWNER');
        await this.chatRepository.remove(chat);
        return null;
      }
    }
    return await this.chatRepository.save(chat);
  }

  async kickUser(userID: string, targetID: string, chatID: number) {
    const chat = await this.findOneChat(chatID);
    const userIndex = chat.users.findIndex((user) => user.id === targetID);
    const adminIndex = chat.admins.findIndex((user) => user.id === targetID);
    if (chat.creator.id === userID) {
      if (userIndex !== -1) chat.users.splice(userIndex, 1);
      if (adminIndex !== -1) chat.admins.splice(adminIndex, 1);
      return await this.chatRepository.save(chat);
    } else {
      const index = chat.admins.findIndex((user) => user.id === userID);
      if (index !== -1 && targetID != chat.creator.id) {
        if (userIndex !== -1) chat.users.splice(userIndex, 1);
        if (adminIndex !== -1) chat.admins.splice(adminIndex, 1);
        return await this.chatRepository.save(chat);
      }
    }
    return null;
  }
}
