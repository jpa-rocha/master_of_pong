import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { of } from 'rxjs';
import { User } from './entities/user.entity';
import { use } from 'passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('name/:userName')
  findAllName(@Param('userName') userName: string) {
    const name = this.usersService.findAllName(userName);
    return name;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const update = this.usersService.update(id, updateUserDto);
    console.log(update)
    return update;
  }

  @Patch('change/name/:id')
  async changeName(@Param('id') id: string, @Body() data: {username: string}, @Res() res: any) {
    const result = await this.usersService.changeName(id, data.username);
    if (result) {
      return res.status(200).json({ message: 'Username changed successfully' });
    }
    else {
      return res.status(200).json({ message: 'Username already exists' });
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('avatars/:id')
  async serveAvatar(@Param('id') id: string, @Res() res: any): Promise<any> {
    const user = await this.usersService.findOne(id);
    res.sendFile(user.avatar, { root: 'src/assets/avatars' });
  }

  async getUser(id: string): Promise<UpdateUserDto> {
    return await this.usersService.findOne(id);
  }

  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/assets/avatars',
        filename: (req, file, cb) => {
          const filename: string = req.params.id + '_avatar_' + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    const user = await this.findOne(id);

    /* if there is already an avatar, delete the old one */
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join('./src/assets/avatars/', user.avatar);
      fs.unlinkSync(filePath);
    }

    this.usersService.update(id, { avatar: file.filename });

    return of({ imagePath: file.filename });
  }

  @Post('addFriend/:userId/:friendId')
  async addFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.usersService.sendFriendRequest(userId, friendId);
  }

  @Post('acceptFriend/:userId/:friendId')
  async acceptFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.usersService.acceptFriendRequest(userId, friendId);
  }

  @Post('rejectFriend/:userId/:friendId')
  async rejectFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.usersService.rejectFriendRequest(userId, friendId);
  }

  @Post('removeFriend/:userId/:friendId')
  async removeFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.usersService.removeFriend(userId, friendId);
  }

  @Get('friends/:user')
  async getFriends(@Param('user') user: string) {
    return this.usersService.getFriends(user);
  }

  @Get('requests/:user')
  async getRequests(@Param('user') user: string) {
    return this.usersService.getRequests(user);
  }

  @Get('friends/name/:user/:input')
  async getNamedFriends(
    @Param('user') user: string,
    @Param('input') input: string,
  ) {
    return this.usersService.getNamedFriends(user, input);
  }

  @Get('testFriends/:user')
  async testFriends(@Param('user') user: string) {
    return this.usersService.getUsersWithFriends(user);
  }

  @Post('leaderboardGet/:user')
  async getLeaderBoard(@Param('user') user: string) {
    console.log('____________________________________________');
    console.log(user);
    console.log('____________________________________________');
    return await this.usersService.getLeaderBoard();
  }
}
