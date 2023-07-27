import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from 'src/chat/dto/create-chat.dto';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Friend) private friendsRepository: Repository<Friend>,
  ) // private chatService: ChatService,
  {}

  create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findAllName(userName: string) {
    const users = await this.usersRepository.find();
    const usersResult = users.filter((user) =>
      user.username.startsWith(userName),
    );

    return usersResult;
  }

  findOne(id: string) {
    const user = this.usersRepository.findOneBy({ id });
    return user;
  }

  async findIDbySocketID(socketID: string) {
    const user = await this.usersRepository.findOne({ where: { socketID } });
    if (!user) {
      throw new Error("This ain't gonna work out");
    }
    return user.id;
  }

  findFortyTwo(forty_two_id: number) {
    const user = this.usersRepository.findOneBy({ forty_two_id });
    return user;
  }

  async updateSocket(socketID: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { socketID } });

    if (!user) {
      throw new Error("Couldn't find user");
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return this.usersRepository.save({ ...user, ...updateUserDto });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  async sendFriendRequest(userId: string, friendId: string) {
    const sender = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['sentFriendRequests', 'receivedFriendRequests'],
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: friendId },
      relations: ['sentFriendRequests', 'receivedFriendRequests'],
    });

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found.');
    }

    const friendRequest = new Friend();
    friendRequest.sender = sender;
    friendRequest.receiver = receiver;
    friendRequest.isFriend = false;

    console.log('sendFriendRequest => Friend request sent');
    await this.friendsRepository.save(friendRequest);

    console.log('sendFriendRequest => Automatically accepting friend request');
    return this.acceptFriendRequest(userId, friendId);
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    const friendRequest = await this.friendsRepository.findOne({
      where: {
        sender: { id: userId },
        receiver: { id: friendId },
      },
    });

    if (!friendRequest) {
      throw new Error('Friend request not found.');
    }

    friendRequest.isFriend = true;
    await this.friendsRepository.save(friendRequest);
    console.log('acceptFriendRequest => Updated friend instance');

    const sender = await this.usersRepository.findOne({
      where: { id: friendId },
      relations: ['sentFriendRequests', 'receivedFriendRequests'],
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['sentFriendRequests', 'receivedFriendRequests'],
    });
    const newFriendRequest = new Friend();
    newFriendRequest.sender = sender;
    newFriendRequest.receiver = receiver;
    newFriendRequest.isFriend = true;
    await this.friendsRepository.save(newFriendRequest);
    console.log('acceptFriendRequest => Second instance of friend created');

    return friendRequest;
  }

  async getFriends(userID: string) {
    interface ExtendedUser extends User {
      isFriend?: boolean;
    }
    const allUsers = (await this.usersRepository.find()).filter(
      (user) => user.id !== userID,
    );
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :userID', { userID })
      .leftJoinAndSelect('user.sentFriendRequests', 'sentFriendRequests')
      .leftJoinAndSelect('sentFriendRequests.receiver', 'receiver')
      .leftJoinAndSelect(
        'user.receivedFriendRequests',
        'receivedFriendRequests',
      )
      .leftJoinAndSelect('receivedFriendRequests.sender', 'sender')
      .getOne();

    if (user) {
      const friends = [
        ...user.sentFriendRequests.map((friend) => ({
          ...friend,
          isFriend: friend.isFriend,
          friendUser: friend.receiver,
        })),
        ...user.receivedFriendRequests.map((friend) => ({
          ...friend,
          isFriend: friend.isFriend,
          friendUser: friend.sender,
        })),
      ];

      const confirmedFriends = friends.filter(
        (friend) => friend.isFriend === true,
      );

      if (confirmedFriends.length > 0) {
        console.log('getFriends => Confirmed friends:');
        confirmedFriends.forEach((friend) => {
          console.log('friendUser : ' + friend.friendUser?.username);
        });

        console.log('getFriends => Adding isFriend property to friends');
        const extendedAllUsers: ExtendedUser[] = allUsers.map((user) => ({
          ...user,
          isFriend: confirmedFriends.some(
            (friend) => friend.friendUser.id === user.id,
          ),
        }));

        return extendedAllUsers;
      } else {
        console.log('getFriends => No confirmed friends found.');
      }
    } else {
      console.log('getFriends => User not found');
    }
    return allUsers;
  }

  async getNamedFriends(userID: string, userName: string) {
    const result = (await this.getFriends(userID)).filter((user) =>
      user.username.startsWith(userName),
    );
    return result;
  }

  // createFriend(createFriendDto: CreateFriendDto) {
  //   const newFriend = this.friendsRepository.create(createFriendDto);

  //   return this.friendsRepository.save(newFriend);
  // }

  // function (userID)
  // returns friends[] => ids of all friends

  async getUsersWithFriends(userId: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .leftJoinAndSelect(
        'user.senders',
        'friend',
        'friend.receiverId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'user.receivers',
        'friend2',
        'friend2.senderId = :userId',
        { userId },
      )
      .addSelect('friend.isFriend')
      .addSelect('friend2.isFriend')
      .getMany();
  }
}
