import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Friend } from './friend.entity';
import { GameData } from 'src/game-data/entities/game-data.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Channel } from 'src/chat/entities/channel.entity';
import { Message } from 'src/chat/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  forty_two_id: number;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: false })
  is_2fa_enabled: boolean;

  @Column({ type: 'float', default: 0.0, nullable: true })
  xp: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  twofa_secret?: string;

  @Column({ type: 'varchar', default: 'offline' })
  status: string;

  @Column({ type: 'varchar', default: null })
  gameID: string;

  @Column({ type: 'varchar', nullable: true })
  socketID: string;

  @Column()
  wins: number;

  @Column()
  losses: number;

  @Column()
  rank: number;

  @Column()
  elo: number;

  /* Friends Relations */
  @OneToMany(() => Friend, (friend) => friend.sender, { onDelete: 'CASCADE' })
  sentFriendRequests: Friend[];

  @OneToMany(() => Friend, (friend) => friend.receiver, { onDelete: 'CASCADE' })
  receivedFriendRequests: Friend[];

  /* Games Relations */
  @OneToMany(() => GameData, (game) => game.userOne, { onDelete: 'CASCADE' })
  gamesAsUserOne: GameData[];

  @OneToMany(() => GameData, (game) => game.userTwo, { onDelete: 'CASCADE' })
  gamesAsUserTwo: GameData[];

  @OneToMany(() => GameData, (game) => game.winner, { onDelete: 'CASCADE' })
  gamesAsWinner: GameData[];

  /* Chat Relations */
  @OneToMany(() => Chat, (chat) => chat.creator)
  chats: Chat[];

  @ManyToMany(() => User, (user) => user.blocked)
  @JoinTable()
  blocked: User[];

  /* Message Relations */
  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  /* Channel Relations */
  @OneToMany(() => Channel, (channel) => channel.owner)
  channels: Channel[];

  @Column({ type: 'boolean', default: false, select: false })
  isFriend: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  sentFriendRequest: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  receivedFriendRequest: boolean;

  @Column({ type: 'boolean', default: true })
  isNew: boolean;
}
