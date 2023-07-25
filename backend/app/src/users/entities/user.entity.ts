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
import { use } from 'passport';
import { Chat } from 'src/chat/entities/chat.entity';
import { Channel } from 'src/chat/entities/channel.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  forty_two_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
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
  twofa_secret: string;

  @Column({ type: 'varchar', default: 'offline' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  socketID: string;

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
  @OneToMany(() => Chat, (chat) => chat)
  chats: Chat[];

  /* Channel Relations */
  @OneToMany(() => Channel, (channel) => channel.owner)
  channels: Channel[];
}
