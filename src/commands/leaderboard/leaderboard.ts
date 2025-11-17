import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../../database/client';
import { COLORS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show leaderboards')
    .addStringOption((opt) =>
      opt
        .setName('type')
        .setDescription('Leaderboard type')
        .setRequired(true)
        .addChoices(
          { name: 'Money', value: 'money' },
          { name: 'Net Worth', value: 'networth' },
          { name: 'XP', value: 'xp' },
        )
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type', true);
    const orderBy = type === 'xp' ? { xp: 'desc' as const } : type === 'networth' ? { netWorth: 'desc' as const } : { balance: 'desc' as const };
    const users = await prisma.user.findMany({ orderBy, take: 10 });
    const embed = new EmbedBuilder()
      .setTitle('Leaderboard')
      .setColor(COLORS.primary)
      .setDescription(users.map((u, i) => `#${i + 1} ${u.username}#${u.discriminator} - ${type === 'xp' ? u.xp : type === 'networth' ? u.netWorth : u.balance}`).join('\n'));
    await interaction.reply({ embeds: [embed] });
  },
};
