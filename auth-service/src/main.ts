import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import prisma from './config/database';
import logger from './utils/logger';
import { correlationIdMiddleware } from './middleware/correlationId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(correlationIdMiddleware);

// Health check route
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info({ correlationId: req.correlationId }, 'Health check passed');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      correlationId: req.correlationId,
    });
  } catch (error) {
    const err = error as Error;
    logger.error({ error: err.message, correlationId: req.correlationId }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      correlationId: req.correlationId,
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Auth Service is running', correlationId: req.correlationId });
});

// User routes
app.use('/', userRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (deve ser o último)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Auth Service started');
});

export default app;
