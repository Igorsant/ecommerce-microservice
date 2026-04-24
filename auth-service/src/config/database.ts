import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
