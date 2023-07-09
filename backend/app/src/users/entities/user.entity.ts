import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from './friend.entity';
import { Game } from 'src/game/entites/game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  forty_two_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 70, nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: false })
  is_2fa_enabled: boolean;

  @Column({ type: 'float', default: 0.0, nullable: true })
  xp: number;


  /* Friends Relations */
  @OneToMany(() => Friend, friend => friend.friend, { onDelete: 'CASCADE' })
  friends: Friend[];

  @OneToMany(() => Friend, friend => friend.user, { onDelete: 'CASCADE' })
  followers: Friend[];

  /* Games Relations */
  @OneToMany(() => Game, game => game.userOne, { onDelete: 'CASCADE' })
  gamesAsUserOne: Game[];

  @OneToMany(() => Game, game => game.userTwo, { onDelete: 'CASCADE' })
  gamesAsUserTwo: Game[];

  @OneToMany(() => Game, game => game.winner, { onDelete: 'CASCADE' })
  gamesAsWinner: Game[];
}
