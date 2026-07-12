import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Fleet Events WebSocket');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken]);

  return socket;
};
