import { closeExpiredRounds } from '../services/lotteryService';
import { logger } from '../utils/logger';

const INTERVAL = 60 * 1000; // check each minute

setInterval(async () => {
  try {
    await closeExpiredRounds();
  } catch (error) {
    logger.error({ error }, 'Failed lottery sweep');
  }
}, INTERVAL);
