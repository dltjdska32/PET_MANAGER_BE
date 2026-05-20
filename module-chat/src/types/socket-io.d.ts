import type { ChatSocketSession } from './chat-socket.types';

declare module 'socket.io' {
  interface SocketData {
    session?: ChatSocketSession;
  }
}

export {};
