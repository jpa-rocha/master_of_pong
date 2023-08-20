import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  gameMode: string;

  @Column()
  gameModeOptions: string;

  @Column()
  score1: number;

  @Column()
  score2: number;

  @ManyToOne(() => User, (user) => user.gamesAsUserOne, { onDelete: 'CASCADE' })
  userOne: User;

  @ManyToOne(() => User, (user) => user.gamesAsUserTwo, { onDelete: 'CASCADE' })
  userTwo: User;

  @ManyToOne(() => User, (user) => user.gamesAsWinner, { onDelete: 'CASCADE' })
  winner: User;
}
