import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config/constants';
import { getOrCreateUser } from '../../services/economyService';
import { prisma } from '../../database/client';

export default {
  data: new SlashCommandBuilder().setName('profile').setDescription('View a user profile').addUserOption((opt) =>
    opt.setName('user').setDescription('User to view').setRequired(false)
  ),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const user = await getOrCreateUser(target.id, target.username, target.discriminator);
    const portfolio = await prisma.userPortfolio.findMany({ where: { userId: target.id } });
    const netWorth = user.balance + user.bankBalance + portfolio.reduce((acc, p) => acc + p.quantity * p.avgBuyPrice, 0);
    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Profile`)
      .setColor(COLORS.primary)
      .addFields(
        { name: 'Level', value: `${user.level} (${user.xp} XP)`, inline: true },
        { name: 'Reputation', value: `${user.reputation}`, inline: true },
        { name: 'Net Worth', value: `${netWorth}`, inline: true },
        { name: 'Wallet', value: `${user.balance}`, inline: true },
        { name: 'Bank', value: `${user.bankBalance}`, inline: true },
        { name: 'Total Trades', value: `${user.totalTrades}`, inline: true },
      )
      .setFooter({ text: `ID: ${target.id}` });
    await interaction.reply({ embeds: [embed] });
  },
};
