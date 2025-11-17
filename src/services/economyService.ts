import { prisma } from '../database/client';
import { ECONOMY_COOLDOWNS, ECONOMY_LIMITS } from '../config/constants';
import { formatDuration } from '../utils/time';

export type EconomyAction = 'daily' | 'weekly' | 'work' | 'crime' | 'rob' | 'give';

export async function getOrCreateUser(userId: string, username: string, discriminator: string) {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { username, discriminator },
    create: { id: userId, username, discriminator },
  });
  return user;
}

export async function ensureCooldown(userId: string, action: EconomyAction): Promise<{ ready: boolean; remaining: string }> {
  const now = new Date();
  const cooldownMs = (ECONOMY_COOLDOWNS as Record<string, number>)[action] || 0;
  if (!cooldownMs) return { ready: true, remaining: '0s' };

  const existing = await prisma.userCooldown.findFirst({ where: { userId, command: action } });
  if (existing && existing.expiresAt > now) {
    return { ready: false, remaining: formatDuration(existing.expiresAt.getTime() - now.getTime()) };
  }
  const expiresAt = new Date(now.getTime() + cooldownMs);
  await prisma.userCooldown.upsert({
    where: { userId_command: { userId, command: action } },
    update: { expiresAt },
    create: { userId, command: action, expiresAt },
  });
  return { ready: true, remaining: '0s' };
}

export async function incrementBalance(userId: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount)) throw new Error('Invalid amount');
  await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: Math.floor(amount) } },
  });
}

export async function transferBalance(fromId: string, toId: string, amount: number): Promise<boolean> {
  if (amount <= 0 || amount > ECONOMY_LIMITS.maxTransfer) return false;
  return prisma.$transaction(async (tx) => {
    const sender = await tx.user.findUnique({ where: { id: fromId } });
    if (!sender || sender.balance < amount) return false;
    await tx.user.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
    await tx.user.update({ where: { id: toId }, data: { balance: { increment: amount } } });
    return true;
  });
}
