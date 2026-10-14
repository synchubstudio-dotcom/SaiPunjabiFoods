import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn(`[Database Warning] Running in offline/in-memory fallback mode for local development without active MongoDB.`);
    return null;
  }
};
