import { User } from 'src/users/entities/user.entity';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chats)
  creator: User;

  @Column()
  channel: string;

  @CreateDateColumn()
  timestamp: string;

  @Column({ type: 'text'})
  message: string;
}
