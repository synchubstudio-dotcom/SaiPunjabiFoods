import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { ENV } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler, AppError } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { HTTP_STATUS } from './constants';

// Route imports
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import promotionRoutes from './routes/promotionRoutes';
import settingsRoutes from './routes/settingsRoutes';
import adminRoutes from './routes/adminRoutes';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  const allowedOrigins = [
    ENV.CLIENT_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.saipunjabifoods.com')) {
          callback(null, true);
        } else {
          callback(null, true); // Allow local preview
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'x-razorpay-signature'],
    })
  );

  // Request logger
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Raw body capture for Razorpay webhooks while preserving json parsing
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
      limit: '10mb',
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(ENV.COOKIE_SECRET));

  // Rate limiting on API routes
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Sai Punjabi API',
      version: '1.0.0',
    });
  });

  // Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // REST API Routes under /api/v1
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/promotions', promotionRoutes);
  app.use('/api/v1/settings', settingsRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 handler
  app.use('*', (req: Request, _res: Response, next) => {
    next(new AppError(`Endpoint ${req.originalUrl} not found on this server`, HTTP_STATUS.NOT_FOUND));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
