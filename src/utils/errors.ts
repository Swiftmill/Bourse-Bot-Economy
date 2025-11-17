import { InteractionReplyOptions } from 'discord.js';
import { COLORS } from '../config/constants';

export function errorReply(message: string): InteractionReplyOptions {
  return {
    ephemeral: true,
    embeds: [
      {
        title: 'Something went wrong',
        description: message,
        color: COLORS.danger,
      },
    ],
  };
}
