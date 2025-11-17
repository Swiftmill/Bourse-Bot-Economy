import { SlashCommandBuilder } from 'discord.js';
import { prisma } from '../../database/client';

export default {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin commands')
    .setDefaultMemberPermissions(0)
    .addSubcommand((sub) => sub.setName('config-show').setDescription('Show guild configuration')),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: 'Guild only command.', ephemeral: true });
      return;
    }
    const settings = await prisma.guildSettings.upsert({
      where: { guildId: interaction.guildId },
      update: {},
      create: { guildId: interaction.guildId },
    });
    await interaction.reply({
      content: `Economy: ${settings.economyEnabled}, Lottery: ${settings.lotteryEnabled}, Currency: ${settings.currencyName} (${settings.currencySymbol})`,
      ephemeral: true,
    });
  },
};
