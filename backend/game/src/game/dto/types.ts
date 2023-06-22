import { Socket } from 'socket.io';
import { gameObject } from './gameObject';
// import { ServerEvents } from '@shared/server/ServerEvents';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | gameObject;
  };

  emit: <T>(event: 'event', data: T) => boolean;
};
