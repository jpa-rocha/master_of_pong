import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Friend } from './entities/friend.entity';
import { FindOneOptions, Repository } from 'typeorm';

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

  async findOne(id: string) {
    const options: FindOneOptions<User> = {
      where: { id },
      relations: ['blocked'],
    };
    return this.usersRepository.findOne(options);
  }

  async findIDbySocketID(socketID: string) {
    const user = await this.usersRepository.findOne({ where: { socketID } });
    if (!user) {
      return;
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
      // throw new Error("Couldn't find user (updateSocket)");
      return null;
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return await this.usersRepository.save({ ...user, ...updateUserDto });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  async checkUsernameStatus(username: string) {
    const options: FindOneOptions<User> = {
      where: { username },
    };
    const check = await this.usersRepository.findOne(options);
    if (!check) return true;
    return false;
  }

  async changeName(userID: string, username: string) {
    const options: FindOneOptions<User> = {
      where: { username },
    };

    if (
      username.length < 3 ||
      username.length > 15 ||
      !/^[a-zA-Z0-9]+$/.test(username)
    ) {
      return;
    }
    const check = await this.usersRepository.findOne(options);
    if (!check) {
      const user = await this.findOne(userID);
      user.username = username;
      return await this.usersRepository.save(user);
    } else return null;
  }

  async sendFriendRequest(userId: string, friendId: string) {
    // TODO NEED A BETTER SOLUTION ------------------------------------------------
    const checkIfExists = await this.friendsRepository.findOne({
      where: {
        sender: { id: userId },
        receiver: { id: friendId },
      },
    });
    if (checkIfExists) return null;
    // ----------------------------------------------------------------------------
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

    return await this.friendsRepository.save(friendRequest);
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    const friendRequest = await this.friendsRepository.findOne({
      where: {
        sender: { id: friendId },
        receiver: { id: userId },
      },
    });

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

  async rejectFriendRequest(userId: string, friendId: string) {
    const friendRequest = await this.friendsRepository.findOne({
      where: {
        sender: { id: friendId },
        receiver: { id: userId },
      },
    });

    if (friendRequest) await this.friendsRepository.remove(friendRequest);
    return null;
  }

  async removeFriend(userId: string, friendId: string) {
    const friendRequests = await this.friendsRepository.find({
      where: [
        {
          sender: { id: friendId },
          receiver: { id: userId },
        },
        {
          sender: { id: userId },
          receiver: { id: friendId },
        },
      ],
    });

    await this.friendsRepository.remove(friendRequests);

    return null;
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
      const friendRequests = [
        ...user.sentFriendRequests.map((friendRequest) => ({
          ...friendRequest,
          isFriend: friendRequest.isFriend,
          friendUser: friendRequest.receiver,
          sentFriendRequest: true,
          receivedFriendRequest: false,
        })),
        ...user.receivedFriendRequests.map((friendRequest) => ({
          ...friendRequest,
          isFriend: friendRequest.isFriend,
          friendUser: friendRequest.sender,
          sentFriendRequest: false,
          receivedFriendRequest: true,
        })),
      ];

      const extendedAllUsers = allUsers.map((user) => ({
        ...user,
        isFriend: friendRequests.some(
          (friendRequest) =>
            friendRequest.friendUser.id === user.id &&
            friendRequest.isFriend === true,
        ),
        sentFriendRequest: friendRequests.some(
          (friendRequest) =>
            friendRequest.friendUser.id === user.id &&
            friendRequest.sentFriendRequest === true,
        ),
        receivedFriendRequest: friendRequests.some(
          (friendRequest) =>
            friendRequest.friendUser.id === user.id &&
            friendRequest.receivedFriendRequest === true,
        ),
      }));
      return extendedAllUsers;
    }
    return allUsers;
  }

  async getNamedFriends(userID: string, userName: string) {
    const result = (await this.getFriends(userID)).filter((user) =>
      user.username.startsWith(userName),
    );
    return result;
  }

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

  async getRequests(userId: string) {
    const requests = await this.friendsRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.sender', 'sender')
      .where('friend.receiver.id = :userId', { userId })
      .andWhere('friend.isFriend = :isFriend', { isFriend: false })
      .getMany();
    return requests;
  }

  //c102072e-9057-4344-976b-ed01fcde0b33

  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return await this.usersRepository.update(userId, {
      twofa_secret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: string) {
    return await this.usersRepository.update(userId, {
      is_2fa_enabled: true,
    });
  }

  async turnOffTwoFactorAuthentication(userId: string) {
    return await this.usersRepository.update(userId, {
      is_2fa_enabled: false,
    });
  }

  async blockUser(userID: string, targetID: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
      relations: ['blocked'],
    });
    if (!user) return null;
    const target = await this.findOne(targetID);
    if (!target) return null;
    if (!user.blocked) user.blocked = [target];
    else user.blocked.push(target);
    await this.usersRepository.save(user);
  }

  async unblockUser(userID: string, targetID: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
      relations: ['blocked'],
    });
    if (!user) return null;
    const target = user.blocked.findIndex((blocked) => blocked.id === targetID);
    if (target === -1) return null;
    user.blocked.splice(target, 1);
    await this.usersRepository.save(user);
  }

  async playerWon(userID: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
    });
    if (user) {
      user.wins++;
      return await this.usersRepository.save(user);
    }
  }

  async playerLost(userID: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userID },
    });
    if (user) {
      user.losses++;
      return await this.usersRepository.save(user);
    }
  }

  async newELO(winnerID: string, loserID: string) {
    const winner = await this.usersRepository.findOne({
      where: { id: winnerID },
    });
    const loser = await this.usersRepository.findOne({
      where: { id: loserID },
    });

    if (winner && loser) {
      const expectationWinner =
        1 / (1 + 10 ** ((loser.elo - winner.elo) / 400));
      const expectationLoser = 1 - expectationWinner;

      const nextWinner = winner.elo + 32 * (1 - expectationWinner);
      const nextLoser = loser.elo + 32 * (0 - expectationLoser);

      winner.elo = Math.round(nextWinner);
      loser.elo = Math.round(nextLoser);
      if (loser.elo < 0) loser.elo = 0;
      await this.usersRepository.save(winner);
      await this.usersRepository.save(loser);
      this.recalculateRanks();
    }
    return null;
  }

  async recalculateRanks() {
    const allUsers = await this.findAll();

    allUsers.sort((a, b) => b.elo - a.elo);
    let rank = 1;
    let previous = allUsers[0].elo;
    for (let i = 0; i < allUsers.length; i++) {
      if (allUsers[i].elo < previous) {
        rank = i + 1;
        previous = allUsers[i].elo;
      }
      allUsers[i].rank = rank;
      await this.usersRepository.save(allUsers[i]);
    }
  }

  async getLeaderBoard() {
    const allUsers = await this.findAll();
    allUsers.sort((a, b) => b.elo - a.elo);

    return allUsers;
  }

  async saveGameID(userID: string, gameID: string) {
    const user = await this.findOne(userID);
    user.gameID = gameID;
    await this.usersRepository.save(user);
  }

  async removeGameID(userID: string) {
    const user = await this.findOne(userID);
    if (!user) return;
    user.gameID = null;
    await this.usersRepository.save(user);
  }

  async addGameID(userID: string, gameID: string) {
    const user = await this.findOne(userID);
    user.gameID = gameID;
    await this.usersRepository.save(user);
  }

  async setIsNew(userID: string) {
    const user = await this.findOne(userID);
    user.isNew = false;
    await this.usersRepository.save(user);
  }
}

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(null, false);
  }
  callback(null, true);
};
