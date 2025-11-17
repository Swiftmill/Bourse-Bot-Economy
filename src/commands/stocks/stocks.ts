import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config/constants';
import { buyStock, listStocks, sellStock } from '../../services/stockService';
import { prisma } from '../../database/client';

export default {
  data: new SlashCommandBuilder()
    .setName('stocks')
    .setDescription('Stock market commands')
    .addSubcommand((sub) => sub.setName('list').setDescription('List tradable stocks'))
    .addSubcommand((sub) =>
      sub
        .setName('buy')
        .setDescription('Buy a stock')
        .addStringOption((opt) => opt.setName('symbol').setDescription('Symbol').setRequired(true))
        .addNumberOption((opt) => opt.setName('quantity').setDescription('Quantity').setRequired(true).setMinValue(0.1))
    )
    .addSubcommand((sub) =>
      sub
        .setName('sell')
        .setDescription('Sell a stock')
        .addStringOption((opt) => opt.setName('symbol').setDescription('Symbol').setRequired(true))
        .addNumberOption((opt) => opt.setName('quantity').setDescription('Quantity').setRequired(true).setMinValue(0.1))
    )
    .addSubcommand((sub) => sub.setName('portfolio').setDescription('View your holdings')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'list') {
      const stocks = await listStocks();
      const embed = new EmbedBuilder()
        .setTitle('Market Board')
        .setColor(COLORS.primary)
        .setDescription(stocks.map((s) => `**${s.symbol}** - ${s.name}: ${s.currentPrice.toFixed(2)} (${(s.volatility * 100).toFixed(1)}% vol)`).join('\n'));
      await interaction.reply({ embeds: [embed] });
      return;
    }
    if (sub === 'portfolio') {
      const holdings = await prisma.userPortfolio.findMany({ where: { userId: interaction.user.id }, include: { stock: true } });
      const embed = new EmbedBuilder()
        .setTitle('Your Portfolio')
        .setColor(COLORS.primary)
        .setDescription(
          holdings.length
            ? holdings
                .map((h) => `${h.stockSymbol}: ${h.quantity.toFixed(2)} @ ${h.avgBuyPrice.toFixed(2)} (Now ${h.stock?.currentPrice.toFixed(2)})`)
                .join('\n')
            : 'No holdings yet.'
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const symbol = interaction.options.getString('symbol', true).toUpperCase();
    const quantity = interaction.options.getNumber('quantity', true);
    const success = sub === 'buy'
      ? await buyStock(interaction.user.id, symbol, quantity)
      : await sellStock(interaction.user.id, symbol, quantity);
    if (!success) {
      await interaction.reply({ content: `${sub === 'buy' ? 'Purchase' : 'Sale'} failed. Check symbol, holdings, or funds.`, ephemeral: true });
      return;
    }
    await interaction.reply({ content: `${sub === 'buy' ? 'Bought' : 'Sold'} ${quantity} of ${symbol}.`, ephemeral: false });
  },
};
