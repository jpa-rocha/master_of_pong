import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn()
  timestamp: string;
}
