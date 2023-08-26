import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Options } from '../movement.dto';
import { Mode } from '../enums/Modes';
import { Paddles } from '../enums/Paddles';
import { User } from '../../users/entities/user.entity';

interface UserProp {
  id: string;
  username: string;
}
@Injectable()
export class Player {
  public id: string;
  public user: User;
  public databaseId: string;
  public ready: boolean;
  public pos: { x: number; y: number };
  public posYOld: number;
  public character: HTMLImageElement;
  public height: number;
  public width: number;
  public speed: number;
  public getOverHere: boolean;
  public freeze: boolean;
  public freezeTimer: NodeJS.Timeout | null = null;
  public deflect: boolean;
  public hasAbility: boolean;
  public abilityCooldown: number;
  public abilityCooldownS: number;
  public ability: number;
  public hasSpecial: boolean;
  public options: Options;
  public moveUp: boolean;
  public moveDown: boolean;
  public moveLeft: boolean;
  public moveRight: boolean;
  public useSpecial: boolean;
  public useAbility: boolean;
  public abilityCount: number;

  constructor(
    private readonly server: Server,
    options: Options,
    public player: number = 2,
  ) {
    this.pos = { x: 20, y: 350 };
    if (options.gameMode === Mode.Regular) {
      this.height = 100;
      this.width = 20;
      this.speed = 10;
    } else {
      switch (options.paddle) {
        case Paddles.Small:
          this.height = 50;
          this.width = 10;
          this.speed = 15;
          break;
        case Paddles.AverageJoe:
          this.height = 100;
          this.width = 20;
          this.speed = 10;
          break;
        case Paddles.BigPete:
          this.height = 160;
          this.width = 32;
          this.speed = 4;
      }
    }
    this.getOverHere = false;
    this.freeze = false;
    this.deflect = false;
    this.hasAbility = true;
    this.hasSpecial = true;
    this.abilityCount = 6;
    this.ability = Math.floor(Math.random() * this.abilityCount);
    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.useSpecial = false;
    this.useAbility = false;
    if (options.dodge) {
      this.abilityCooldown = 5000;
      this.abilityCooldownS = 4;
    } else if (options.hyper) {
      this.abilityCooldown = 5000;
      this.abilityCooldownS = 4;
    } else {
      this.abilityCooldown = 15000;
      this.abilityCooldownS = 14;
    }
    this.options = options;
    this.id = null;
    this.ready = false;
  }

  public setValues(
    x: number,
    y: number,
    height: number,
    width: number,
    speed: number,
    options: Options,
  ): void {
    this.pos.x = x;
    this.pos.y = y;
    this.height = height;
    this.width = width;
    this.speed = speed;
    this.options = options;
  }

  public resetPos(height: number) {
    this.pos.y = (height - this.height) / 2;
  }

  public sendToClient<T>(event: any, payload: T) {
    this.server.to(this.id).emit(event, payload);
  }

  public setAbility(): void {
    this.hasAbility = false;
    this.sendToClient<{ hasAbility: boolean }>('hasAbility', {
      hasAbility: false,
    });

    let seconds = this.abilityCooldownS;
    this.sendToClient<{ secondsLeft: number }>('secondsLeft', {
      secondsLeft: seconds + 1,
    });
    const abilityTimer = setInterval(() => {
      this.sendToClient<{ secondsLeft: number }>('secondsLeft', {
        secondsLeft: seconds,
      });
      if (seconds === 1) {
        clearInterval(abilityTimer);
        return;
      }
      seconds--;
    }, 1000);
    this.ability = Math.floor(Math.random() * this.abilityCount);
    setTimeout(() => {
      this.hasAbility = true;
      this.sendToClient<{ hasAbility: boolean; ability: number }>(
        'hasAbility',
        { hasAbility: true, ability: this.ability },
      );
    }, this.abilityCooldown);
  }

  setSpecial(): void {
    this.hasSpecial = false;
    this.sendToClient<{ hasUlt: boolean }>('hasUlt', {
      hasUlt: false,
    });
    let seconds = this.abilityCooldownS;
    this.sendToClient<{ secondsLeftUlt: number }>('secondsLeftUlt', {
      secondsLeftUlt: seconds + 1,
    });
    const ultimateTimer = setInterval(() => {
      this.sendToClient<{ secondsLeftUlt: number }>('secondsLeftUlt', {
        secondsLeftUlt: seconds,
      });
      if (seconds === 1) {
        clearInterval(ultimateTimer);
        return;
      }
      seconds--;
    }, 1000);
    setTimeout(() => {
      this.hasSpecial = true;
      this.sendToClient<{ hasUlt: boolean }>('hasUlt', {
        hasUlt: true,
      });
    }, this.abilityCooldown);
  }

  SoundGrenade(): void {
    this.sendToClient('SoundGrenade', {});
  }
}
