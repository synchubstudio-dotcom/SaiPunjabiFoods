'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  joinOrderRoom: (orderId: string) => void;
  leaveOrderRoom: (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('sai_punjabi_token');
    }

    const s = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    s.on('connect', () => {
      if (user?.role === 'admin') {
        s.emit('join:admin');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const joinOrderRoom = (orderId: string) => {
    if (socket && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  const leaveOrderRoom = (orderId: string) => {
    if (socket && orderId) {
      socket.emit('leave:order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinOrderRoom, leaveOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
