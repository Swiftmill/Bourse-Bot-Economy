import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config/constants';
import { ensureCooldown, getOrCreateUser, incrementBalance } from '../../services/economyService';

const DAILY_REWARD = 500;

export default {
  data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily reward'),
  async execute(interaction) {
    const { ready, remaining } = await ensureCooldown(interaction.user.id, 'daily');
    if (!ready) {
      await interaction.reply({ content: `You need to wait ${remaining} before claiming daily again.`, ephemeral: true });
      return;
    }
    await getOrCreateUser(interaction.user.id, interaction.user.username, interaction.user.discriminator);
    await incrementBalance(interaction.user.id, DAILY_REWARD);
    const embed = new EmbedBuilder().setTitle('Daily Reward').setColor(COLORS.success).setDescription(`You received ${DAILY_REWARD} coins!`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
