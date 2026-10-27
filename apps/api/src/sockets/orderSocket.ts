import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/token';

let io: SocketIOServer | null = null;

export const initSocket = (serverIo: SocketIOServer) => {
  io = serverIo;

  io.on('connection', (socket: Socket) => {
    // Authenticate socket if token is present in auth handshake
    const token = socket.handshake.auth?.token;
    let userPayload: any = null;
    if (token) {
      try {
        userPayload = verifyToken(token);
        socket.data.user = userPayload;
      } catch {
        // Guest socket connection allowed for tracking public order tokens
      }
    }

    // Join order tracking room
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('leave:order', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    // Join admin dashboard room (only if authenticated admin)
    socket.on('join:admin', () => {
      if (socket.data.user && socket.data.user.role === 'admin') {
        socket.join('admin:orders');
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => io;

export const emitOrderStatusUpdate = (orderId: string, orderData: any) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit('order:status_changed', orderData);
  io.to('admin:orders').emit('order:status_changed', orderData);
};

export const emitNewOrder = (orderData: any) => {
  if (!io) return;
  io.to('admin:orders').emit('order:created', orderData);
};

export const emitMenuUpdate = (type: 'create' | 'update' | 'delete', product: any) => {
  if (!io) return;
  io.emit('menu:changed', { type, product });
  io.emit(`product:${type}d`, product);
};
