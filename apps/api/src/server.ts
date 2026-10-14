import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/orderSocket';
import { ENV } from './config/env';

const startServer = async () => {
  // 1. Connect Database
  await connectDB();

  // 2. Initialize Express application
  const app = createApp();
  const server = http.createServer(app);

  // 3. Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        ENV.CLIENT_ORIGIN,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);

  // 4. Start HTTP Server
  server.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Sai Punjabi API running in [${ENV.NODE_ENV}] mode`);
    console.log(`📡 URL: http://localhost:${ENV.PORT}`);
    console.log(`📖 Swagger API Docs: http://localhost:${ENV.PORT}/api/docs`);
    console.log(`⚡ WebSocket Server active for real-time order tracking`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
