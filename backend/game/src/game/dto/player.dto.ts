import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Options } from '../movement.dto';
import { Mode } from '../enums/Modes';
import { Paddles } from '../enums/Paddles';

@Injectable()
export class Player {
  public id: string;
  public pos: { x: number; y: number };
  public character: HTMLImageElement;
  public height: number;
  public width: number;
  public speed: number;
  public getOverHere: boolean;
  public freeze: boolean;
  public freezeTimer: NodeJS.Timeout | null = null;
  public hasAbility: boolean;
  public ability: number;
  public hasSpecial: boolean;
  public options: Options;
  public moveUp: boolean;
  public moveDown: boolean;
  public useSpecial: boolean;
  public useAbility: boolean;

  constructor(
    private readonly server: Server,
    options: Options,
    public player: number = 2,
  ) {
    this.pos = { x: 10, y: 250 };
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
    this.hasAbility = true;
    this.hasSpecial = true;
    this.ability = Math.floor(Math.random() * 5);
    this.moveUp = false;
    this.moveDown = false;
    this.useSpecial = false;
    this.useAbility = false;
    this.options = options;
    this.id = null;
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

    let seconds = 14;
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
    this.ability = Math.floor(Math.random() * 5);
    setTimeout(() => {
      this.hasAbility = true;
      this.sendToClient<{ hasAbility: boolean; ability: number }>(
        'hasAbility',
        { hasAbility: true, ability: this.ability },
      );
    }, 15000);
  }

  setSpecial(): void {
    this.hasSpecial = false;
    this.sendToClient<{ hasUlt: boolean }>('hasUlt', {
      hasUlt: false,
    });
    let seconds = 14;
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
    }, 15000);
  }

  SoundGrenade(): void {
    // this.gameObject.clients.get(client.id);
    this.sendToClient('SoundGrenade', {});
  }
}
