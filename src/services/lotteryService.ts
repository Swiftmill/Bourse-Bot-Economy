import { prisma } from '../database/client';
import { LOTTERY_DEFAULTS } from '../config/constants';
import { logger } from '../utils/logger';

export async function getActiveRound() {
  const now = new Date();
  let round = await prisma.lotteryRound.findFirst({ where: { status: 'OPEN' }, orderBy: { id: 'desc' } });
  if (!round) {
    round = await prisma.lotteryRound.create({
      data: { status: 'OPEN', startedAt: now, endsAt: new Date(now.getTime() + 15 * 60 * 1000) },
    });
  }
  return round;
}

export async function buyTickets(userId: string, amount: number): Promise<boolean> {
  if (amount <= 0 || amount > LOTTERY_DEFAULTS.maxTicketsPerUser) return false;
  return prisma.$transaction(async (tx) => {
    const round = await getActiveRound();
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.balance < amount * LOTTERY_DEFAULTS.ticketPrice) return false;
    await tx.user.update({ where: { id: userId }, data: { balance: { decrement: amount * LOTTERY_DEFAULTS.ticketPrice }, totalLotteryTickets: { increment: amount } } });
    await tx.lotteryTicket.create({ data: { roundId: round.id, userId, count: amount } });
    await tx.lotteryRound.update({ where: { id: round.id }, data: { totalPool: { increment: amount * LOTTERY_DEFAULTS.ticketPrice } } });
    return true;
  });
}

export async function closeExpiredRounds(): Promise<void> {
  const now = new Date();
  const rounds = await prisma.lotteryRound.findMany({ where: { status: 'OPEN', endsAt: { lt: now } } });
  for (const round of rounds) {
    await drawRound(round.id);
  }
}

export async function drawRound(roundId: number): Promise<void> {
  const round = await prisma.lotteryRound.findUnique({ where: { id: roundId }, include: { tickets: true } });
  if (!round || round.status !== 'OPEN') return;
  if (round.tickets.length === 0) {
    await prisma.lotteryRound.update({ where: { id: roundId }, data: { status: 'DRAWN' } });
    return;
  }
  const pool = round.totalPool;
  const pot = Math.floor(pool * LOTTERY_DEFAULTS.winnerShare);
  const winner = pickWeightedWinner(round.tickets);
  if (winner) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: winner.userId }, data: { balance: { increment: pot }, totalWon: { increment: pot } } }),
      prisma.lotteryRound.update({ where: { id: roundId }, data: { status: 'DRAWN' } }),
    ]);
    logger.info({ roundId, winner: winner.userId, pot }, 'Lottery winner drawn');
  }
  await prisma.lotteryRound.create({
    data: { status: 'OPEN', startedAt: new Date(), endsAt: new Date(Date.now() + 15 * 60 * 1000) },
  });
}

function pickWeightedWinner(tickets: { userId: string; count: number }[]): { userId: string; count: number } | null {
  const total = tickets.reduce((acc, t) => acc + t.count, 0);
  if (total === 0) return null;
  let roll = Math.random() * total;
  for (const ticket of tickets) {
    if (roll < ticket.count) return ticket;
    roll -= ticket.count;
  }
  return tickets[0];
}
