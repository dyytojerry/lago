import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { connectRedis, cacheService } from './config/redis';
import { setupSwagger } from './config/swagger.config';
import { corsMiddleware, corsPreflightMiddleware, corsDebugMiddleware } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authUser, authOperation } from './middleware/auth';
import { createSuccessResponse } from './lib/response';

// Routes
import authRoutes from './routes/auth.routes';
import shareRoutes from './routes/share.routes';
import publicRoutes from './routes/public.routes';
import dashboardRoutes from './routes/dashboard.routes';
import productsRoutes from './routes/products.routes';
import productsAppRoutes from './routes/products.app.routes';
import ordersAppRoutes from './routes/orders.app.routes';
import chatAppRoutes from './routes/chat.app.routes';
import communitiesAppRoutes from './routes/communities.app.routes';
import usersAppRoutes from './routes/users.app.routes';
import usersRoutes from './routes/users.routes';
import ordersRoutes from './routes/orders.routes';
import communitiesRoutes from './routes/communities.routes';
import operationSystemRoutes from './routes/operation.roles.routes';
import uploadRoutes from './routes/upload.routes';
import onboardingAppRoutes from './routes/onboarding.app.routes';
import onboardingAdminRoutes from './routes/onboarding.admin.routes';


// Load environment variables
dotenv.config();

const app = express();

// SSL configuration
const isHttps = process.env.USE_HTTPS === 'true';
let server: any;
// let io: any;

if (isHttps) {
  try {
    const sslPath = process.env.NODE_ENV !== 'production' ? join(process.cwd(), '..', '..', 'ssl') : join(process.cwd(), 'ssl');
    const options = {
      key: readFileSync(join(sslPath, 'localhost-key.pem')),
      cert: readFileSync(join(sslPath, 'localhost-cert.pem'))
    };
    server = createHttpsServer(options, app);
    logger.info('HTTPS server configured');
  } catch (error: any) {
    logger.warn('Failed to load SSL certificates, falling back to HTTP:', error.message);
    server = createServer(app);
  }
} else {
  server = createServer(app);
}

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// CORS configuration
app.use(corsMiddleware);

// 处理预检请求
app.options('*', corsPreflightMiddleware);

// CORS调试中间件（仅在开发环境启用）
app.use(corsDebugMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (_req, res) => {
  return createSuccessResponse(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


// 路由
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/share', authUser, shareRoutes);
app.use('/api/products', authUser,productsAppRoutes);
app.use('/api/orders', authUser, ordersAppRoutes);
app.use('/api/chat', authUser, chatAppRoutes);
app.use('/api/communities', authUser, communitiesAppRoutes);
app.use('/api/users', authUser, usersAppRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/onboarding', authUser, onboardingAppRoutes);
app.use('/api/admin/dashboard', authOperation, dashboardRoutes);
app.use('/api/admin/products', authOperation, productsRoutes);
app.use('/api/admin/users', authOperation, usersRoutes);
app.use('/api/admin/orders', authOperation, ordersRoutes);
app.use('/api/admin/communities', authOperation, communitiesRoutes);
app.use('/api/admin/system',authOperation,  operationSystemRoutes);
app.use('/api/admin/onboarding', onboardingAdminRoutes);


// Initialize WebSocket service
// initializeWebSocketService(io);

// Initialize Chess WebSocket service
// initializeChessSocket(io);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    const redisClient = await connectRedis();
    logger.info('Redis connected successfully');

    cacheService.setClient(redisClient);

    // Initialize Cron Scheduler
    // CronScheduler.initialize();
    logger.info('Cron scheduler initialized');

    // Start server
    server.listen(PORT, () => {
      const protocol = isHttps ? 'https' : 'http';
      logger.info(`Server running on ${protocol}://localhost:${PORT}`);
      logger.info(`API docs: http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (isHttps) {
        logger.info('HTTPS enabled - SSL certificates loaded');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start the server
startServer();

// export { io };

