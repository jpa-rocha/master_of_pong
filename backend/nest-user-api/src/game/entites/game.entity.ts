import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userOne: number;

  @Column({ type: 'int' })
  userTwo: number;

  @Column({ type: 'int' })
  winner: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;
}
