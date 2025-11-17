import { prisma } from '../database/client';
import { STOCK_DEFAULTS } from '../config/constants';

export async function listStocks() {
  return prisma.stock.findMany({ orderBy: { symbol: 'asc' } });
}

export async function getStock(symbol: string) {
  return prisma.stock.findUnique({ where: { symbol } });
}

export async function updateStockPrices(): Promise<void> {
  const stocks = await prisma.stock.findMany();
  const now = new Date();
  for (const stock of stocks) {
    const drift = (Math.random() - 0.5) * stock.volatility;
    const newPrice = Math.max(1, stock.currentPrice * (1 + drift));
    await prisma.stock.update({ where: { symbol: stock.symbol }, data: { currentPrice: newPrice, lastUpdateAt: now } });
    await prisma.stockHistory.create({ data: { stockSymbol: stock.symbol, price: newPrice, timestamp: now } });
  }
}

export async function buyStock(userId: string, symbol: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) return false;
  return prisma.$transaction(async (tx) => {
    const stock = await tx.stock.findUnique({ where: { symbol } });
    if (!stock) return false;
    const cost = stock.currentPrice * quantity;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.balance < cost) return false;

    await tx.user.update({ where: { id: userId }, data: { balance: { decrement: Math.floor(cost) }, totalTrades: { increment: 1 } } });
    const portfolio = await tx.userPortfolio.upsert({
      where: { userId_stockSymbol: { userId, stockSymbol: symbol } },
      update: {
        quantity: { increment: quantity },
        avgBuyPrice: (stock.currentPrice + stock.currentPrice) / 2,
      },
      create: { userId, stockSymbol: symbol, quantity, avgBuyPrice: stock.currentPrice },
    });
    return !!portfolio;
  });
}

export async function sellStock(userId: string, symbol: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) return false;
  return prisma.$transaction(async (tx) => {
    const stock = await tx.stock.findUnique({ where: { symbol } });
    if (!stock) return false;
    const holding = await tx.userPortfolio.findUnique({ where: { userId_stockSymbol: { userId, stockSymbol: symbol } } });
    if (!holding || holding.quantity < quantity) return false;

    const proceeds = stock.currentPrice * quantity;
    await tx.userPortfolio.update({
      where: { userId_stockSymbol: { userId, stockSymbol: symbol } },
      data: { quantity: { decrement: quantity } },
    });
    await tx.user.update({ where: { id: userId }, data: { balance: { increment: Math.floor(proceeds) }, totalTrades: { increment: 1 } } });
    return true;
  });
}

export async function bootstrapStocks(): Promise<void> {
  const count = await prisma.stock.count();
  if (count > 0) return;
  const seeds = [
    { symbol: 'TECH', name: 'Tech Growth', currentPrice: 120, volatility: STOCK_DEFAULTS.baseVolatility },
    { symbol: 'PGC', name: 'Premier Global Corp', currentPrice: 95, volatility: STOCK_DEFAULTS.baseVolatility * 0.8 },
    { symbol: 'CRYPTO', name: 'Crypto Index', currentPrice: 60, volatility: STOCK_DEFAULTS.baseVolatility * 1.6 },
  ];
  await prisma.stock.createMany({ data: seeds });
}
