import { Client, Collection, GatewayIntentBits, Interaction } from 'discord.js';
import path from 'path';
import { env } from './config/env';
import { logger } from './utils/logger';
import { loadCommands, registerSlashCommands } from './utils/commandLoader';
import { Command } from './types/Command';
import { connectDatabase } from './database/client';
import './jobs/lotteryScheduler';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

(async () => {
  await connectDatabase();
  const commandsPath = path.join(__dirname, 'commands');
  const commands = await loadCommands(commandsPath);
  client.commands = commands as Collection<string, Command>;

  await registerSlashCommands(Array.from(commands.values()));

  client.on('ready', () => {
    logger.info(`Logged in as ${client.user?.tag}`);
  });

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error({ error }, 'Command execution failed');
      if (interaction.isRepliable()) {
        await interaction.reply({
          ephemeral: true,
          content: 'An error occurred while executing this command.',
        }).catch(() => undefined);
      }
    }
  });

  if (!env.token) {
    logger.error('DISCORD_TOKEN is missing');
    return;
  }
  await client.login(env.token);
})();

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
  }
}
