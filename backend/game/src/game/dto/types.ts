import { Socket } from 'socket.io';
import { GameObject } from '../gameObject';
// import { ServerEvents } from '@shared/server/ServerEvents';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | GameObject;
  };

  emit: <T>(event: 'event', data: T) => boolean;
};
