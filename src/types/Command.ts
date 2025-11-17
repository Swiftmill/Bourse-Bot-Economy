import { ChatInputCommandInteraction, SlashCommandBuilder, ContextMenuCommandBuilder, PermissionResolvable } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder | ContextMenuCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  guildOnly?: boolean;
  permissions?: PermissionResolvable[];
}
