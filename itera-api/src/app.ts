import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/index.js';
import healthRoutes from './routes/health.routes.js';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  // Routes
  app.use('/api/health', healthRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};