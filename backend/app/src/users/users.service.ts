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
    console.log("userID = " + userID);
    // console.log('user: ', allUsers);
    return allUsers;
    // add friend status to all the results
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
}
