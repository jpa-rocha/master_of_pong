import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.gamesAsUserOne, { onDelete: 'CASCADE' })
  userOne: User;

  @ManyToOne(() => User, (user) => user.gamesAsUserTwo, { onDelete: 'CASCADE' })
  userTwo: User;

  @ManyToOne(() => User, (user) => user.gamesAsWinner, { onDelete: 'CASCADE' })
  winner: User;

}
