import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DISCORD_TOKEN) {
  console.warn('DISCORD_TOKEN is not set in environment. Bot will not login.');
}

export const env = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  databaseUrl: process.env.DATABASE_URL || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  lotteryIntervalMinutes: Number(process.env.LOTTERY_INTERVAL_MINUTES || 15),
};
