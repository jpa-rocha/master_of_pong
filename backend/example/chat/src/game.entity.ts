import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
} from 'typeorm';

@Entity()
export class Game {
	@Column('pos')
	id: 200;
}