export const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
};

export const ECONOMY_COOLDOWNS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  work: 60 * 60 * 1000,
  crime: 60 * 60 * 1000,
  rob: 3 * 60 * 60 * 1000,
};

export const ECONOMY_LIMITS = {
  maxTransfer: 1_000_000,
  maxBet: 500_000,
};

export const LOTTERY_DEFAULTS = {
  ticketPrice: 100,
  winnerShare: 0.8,
  maxTicketsPerUser: 100,
};

export const STOCK_DEFAULTS = {
  updateMinutes: 5,
  baseVolatility: 0.05,
};
