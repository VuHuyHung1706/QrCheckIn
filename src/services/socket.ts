import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
  // If deployed to production (e.g. Vercel + Render/Railway backend)
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // Local development
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const socket: Socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
});
