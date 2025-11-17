import { Collection, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from '../types/Command';
import { env } from '../config/env';
import { logger } from './logger';

export async function loadCommands(commandsPath: string): Promise<Collection<string, Command>> {
  const commands = new Collection<string, Command>();
  const files = fs.readdirSync(commandsPath);

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const nested = await loadCommands(filePath);
      nested.forEach((cmd, key) => commands.set(key, cmd));
      continue;
    }
    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
    const commandModule = await import(filePath);
    const command: Command = commandModule.default;
    if (command?.data && 'name' in command.data) {
      commands.set(command.data.name, command);
    }
  }
  return commands;
}

export async function registerSlashCommands(commandList: Command[]): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(env.token);
  const payload = commandList.map((cmd) => (cmd.data as SlashCommandBuilder).toJSON());
  try {
    await rest.put(Routes.applicationCommands(env.clientId), { body: payload });
    logger.info(`Registered ${payload.length} application commands.`);
  } catch (error) {
    logger.error({ error }, 'Failed to register commands');
  }
}
