import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.channels)
  owner: User;

  @Column({ type: 'varchar', length: 15, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  password: string;

  @CreateDateColumn()
  created_at: Date;
}
