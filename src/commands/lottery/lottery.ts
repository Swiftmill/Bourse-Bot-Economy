import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { buyTickets, getActiveRound } from '../../services/lotteryService';
import { COLORS, LOTTERY_DEFAULTS } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('lottery')
    .setDescription('Lottery commands')
    .addSubcommand((sub) => sub.setName('info').setDescription('Show current round info'))
    .addSubcommand((sub) =>
      sub.setName('buy').setDescription('Buy lottery tickets').addIntegerOption((opt) =>
        opt.setName('amount').setDescription('Number of tickets').setRequired(true).setMinValue(1)
      )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'info') {
      const round = await getActiveRound();
      const embed = new EmbedBuilder()
        .setTitle('Lottery')
        .setColor(COLORS.primary)
        .addFields(
          { name: 'Status', value: round.status, inline: true },
          { name: 'Pool', value: `${round.totalPool}`, inline: true },
          { name: 'Ends', value: `<t:${Math.floor(round.endsAt.getTime() / 1000)}:R>`, inline: true },
          { name: 'Ticket Price', value: `${LOTTERY_DEFAULTS.ticketPrice}`, inline: true },
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    const success = await buyTickets(interaction.user.id, amount);
    if (!success) {
      await interaction.reply({ content: 'Ticket purchase failed. Check funds or limits.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: `Bought ${amount} tickets. Good luck!`, ephemeral: false });
  },
};
