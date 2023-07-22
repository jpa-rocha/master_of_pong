import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Friend) private friendsRepository: Repository<Friend>,
  ) {}

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

  findFortyTwo(forty_two_id: number) {
    const user = this.usersRepository.findOneBy({ forty_two_id });
    return user;
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

    console.log('Friend Request sent: ' + friendRequest);
    // return this.friendsRepository.save(friendRequest);
    await this.friendsRepository.save(friendRequest);
    return this.acceptFriendRequest(userId, friendId);
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    console.log('userId ' + userId);
    console.log('friendId ' + friendId);
    const friendRequest = await this.friendsRepository.findOne({
      where: {
        sender: { id: userId },
        receiver: { id: friendId },
      },
    });

    console.log('friendRequest ' + friendRequest);
    if (!friendRequest) {
      throw new Error('Friend request not found.');
    }

    friendRequest.isFriend = true;
    await this.friendsRepository.save(friendRequest);

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

    return friendRequest;
  }

  async getUserFriends(userID: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
      relations: ['sentFriendRequests', 'receivedFriendRequests'],
    });
    if (!user) {
      throw new Error('User not found.');
    }
    console.log(
      'Friends (hopefully) sender = ' + user.sentFriendRequests[0].sender,
    );
    console.log(
      'Friends (hopefully) receiver = ' + user.sentFriendRequests[0].receiver,
    );
    return user.sentFriendRequests;
  }

  async checkFriend(userId: string, friendId: string) {
    const user = await this.usersRepository.find({
      where: { id: userId },
      relations: ['senders', 'receivers'],
    });

    return user;
  }

  async getFriends(userID: string) {
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

      console.log('Friends NAMES --------------------------------------------');
      const confirmedFriends = friends.filter(
        (friend) => friend.isFriend === true,
      );

      if (confirmedFriends.length > 0) {
        console.log('Confirmed friends:');
        confirmedFriends.forEach((friend) => {
          console.log('friendUser : ' + friend.friendUser?.username);
        });
      } else {
        console.log('No confirmed friends found.');
      }
    } else {
      console.log('User not found');
    }
    console.log('------------------------------------------------------------');
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
