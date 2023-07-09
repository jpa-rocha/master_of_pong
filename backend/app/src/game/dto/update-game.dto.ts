import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';

export class UpdateUserDto extends PartialType(CreateGameDto) {}
