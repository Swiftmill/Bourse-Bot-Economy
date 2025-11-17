import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrCreateUser } from '../../services/economyService';
import { COLORS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder().setName('balance').setDescription('Check your wallet and bank balance'),
  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.user.username, interaction.user.discriminator);
    const embed = new EmbedBuilder()
      .setTitle('Your Balance')
      .setColor(COLORS.primary)
      .addFields(
        { name: 'Wallet', value: `${user.balance}`, inline: true },
        { name: 'Bank', value: `${user.bankBalance}`, inline: true },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
