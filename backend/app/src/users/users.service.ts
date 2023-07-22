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
      relations: ['friends'],
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: friendId },
      relations: ['friends'],
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
    this.friendsRepository.save(friendRequest);
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

    return friendRequest;
  }

  async getUserFriends(userID: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
      relations: ['friends'],
    });
    if (!user) {
      throw new Error('User not found.');
    }
    return user.friends;
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

    const usersFriends = await this.getUserFriends(userID);
    console.log('Friends = ' + usersFriends);
    // const user = await this.usersRepository
    //   .createQueryBuilder('user')
    //   .where('user.id = :userID', { userID }) // Assuming userID is the ID of the user you want to fetch
    //   .leftJoinAndSelect('user.senders', 'senders')
    //   .leftJoinAndSelect('user.receivers', 'receivers')
    //   .leftJoinAndSelect('senders.sender', 'sender') // Load the related sender User entity
    //   .leftJoinAndSelect('receivers.receiver', 'receiver') // Load the related receiver User entity
    //   .getOne();

    // if (user) {
    //   const friends = [
    //     ...user.sentFriendRequests,
    //     ...user.receivedFriendRequests,
    //   ];

    //   if (friends) {
    //     console.log('friends = ' + friends);
    //     console.log('id       : ' + friends[1].id);
    //     console.log('isFriend : ' + friends[1].isFriend);
    //     console.log('receiver : ' + friends[1].receiver?.username);
    //     console.log('sender   : ' + friends[1].sender?.username);
    //   }
    // } else {
    //   console.log('User not found');
    // }
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
}
