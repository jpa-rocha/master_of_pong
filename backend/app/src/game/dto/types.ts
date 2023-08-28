import { Socket } from 'socket.io';
import { GameObject } from '../gameObject';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | GameObject;
  };

  emit: <T>(event: 'event', data: T) => boolean;
};
