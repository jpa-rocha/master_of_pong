import { User } from 'src/users/entities/user.entity';
import { Message } from './message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15, unique: true })
  title: string;

  @ManyToOne(() => User, (user) => user.chats)
  creator: User;

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  banned: User[];

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  muted: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column({ type: 'varchar', length: 15, unique: true })
  channel: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  password: string;

  @CreateDateColumn()
  timestamp: Date;
}
