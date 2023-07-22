import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Not, Repository } from 'typeorm';
import { type } from 'os';
import { use } from 'passport';
import { CreateFriendDto } from './dto/create-friend.dto';

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

  async addFriend(userId: string, friendId: string) {
    const user = await this.findOne(userId);
    const friend = await this.findOne(friendId);

    const createFriendDto: CreateFriendDto = {
      isFriend: false,
      user: user,
      friend: friend,
    };
    const newFriend = this.friendsRepository.create(createFriendDto);
    return this.friendsRepository.save(newFriend);
  }

  async checkFriend(userId: string, friendId: string) {
    // const friends = await this.friendsRepository.find();

    // const temporary = friends.filter((friend) =>
    // friend..startsWith(userName),
    // );

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
    // console.log('userID = ' + userID);
    // console.log(
    //   'RECEIVERS = ' +
    //     (await this.usersRepository.find({ relations: ['receivers'] })),
    // );
    // console.log('SENDERS = ' + (await this.findOne(userID)).senders);
    // console.log('user: ', allUsers);

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :userID', { userID }) // Assuming userID is the ID of the user you want to fetch
      .leftJoinAndSelect('user.senders', 'senders')
      .leftJoinAndSelect('user.receivers', 'receivers')
      .leftJoinAndSelect('senders.sender', 'sender') // Load the related sender User entity
      .leftJoinAndSelect('receivers.receiver', 'receiver') // Load the related receiver User entity
      .getOne();

    if (user) {
      const friends = [...user.senders, ...user.receivers];

      console.log('friends = ' + friends);
      console.log('id       : ' + friends[1].id);
      console.log('isFriend : ' + friends[1].isFriend);
      console.log('receiver : ' + friends[1].receiver?.username);
      console.log('sender   : ' + friends[1].sender?.username);
    } else {
      console.log('User not found');
    }
    return allUsers;
    // add friend status to all the results
  }

  // async getUserWithFriends(userId: string): Promise<User> {
  //   return this.createQueryBuilder('user')
  //     .leftJoinAndSelect('user.senders', 'friendSenders')
  //     .leftJoinAndSelect('user.receivers', 'friendReceivers')
  //     .where('user.id = :id', { id: userId })
  //     .getOne();
  // }

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
