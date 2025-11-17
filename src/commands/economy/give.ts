import { SlashCommandBuilder } from 'discord.js';
import { transferBalance, getOrCreateUser } from '../../services/economyService';

export default {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Transfer funds to another user')
    .addUserOption((opt) => opt.setName('user').setDescription('Recipient').setRequired(true))
    .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to send').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    if (target.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot pay yourself.', ephemeral: true });
      return;
    }
    await getOrCreateUser(target.id, target.username, target.discriminator);
    await getOrCreateUser(interaction.user.id, interaction.user.username, interaction.user.discriminator);
    const success = await transferBalance(interaction.user.id, target.id, amount);
    if (!success) {
      await interaction.reply({ content: 'Transfer failed. Check balance and limits.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: `Sent ${amount} coins to ${target.username}.`, ephemeral: false });
  },
};
