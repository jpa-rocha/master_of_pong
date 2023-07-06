import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  isFriend: boolean;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, (user) => user.friends, { onDelete: 'CASCADE' })
  friend: User;
}
