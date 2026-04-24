import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ApiError extends Error {
  status?: number;
  correlationId?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  const correlationId = req.correlationId || 'unknown';

  logger.error(
    {
      status,
      message,
      correlationId,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    'Unhandled error'
  );

  res.status(status).json({
    error: message,
    status,
    correlationId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn(
    { path: req.path, method: req.method, correlationId: req.correlationId },
    'Route not found'
  );

  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
  });
};
