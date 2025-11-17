import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    process.exit(1);
  }
}
