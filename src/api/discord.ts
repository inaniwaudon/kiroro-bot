import fetch from 'node-fetch';
import { Bindings } from '../bindings';

const discordEndpoint = 'https://discord.com/api/v10';
const DEAFULT_MESSAGE_TYPE = 0;

type snowflake = string;

interface DiscordMessage {
  id: snowflake;
  channel_id: snowflake;
  author: DiscordUser;
  content: string;
  timestamp: string;
  type: number;
}

interface DiscordUser {
  id: snowflake;
  username: string;
  discriminator: string;
  global_name: string;
  bot: boolean;
}

export const getLatestDiscordMessageContents = async (
  channelId: string,
  limit: number,
  env: Bindings,
): Promise<string[]> => {
  const params = new URLSearchParams({ limit: limit.toString() }).toString();
  const endpoint = `${discordEndpoint}/channels/${channelId}/messages?${params}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      },
    });
    if (response.ok) {
      const messages = (await response.json()) as DiscordMessage[];
      const contents: string[] = [];
      for (const message of messages) {
        // sent by other members
        if (!message.author.bot && message.type === DEAFULT_MESSAGE_TYPE) {
          contents.push(message.content);
        }
        // via slash command of kiroro
        if (message.author.id === env.KIRORO_ID) {
          const lines = message.content.split('\n');
          if (lines.length > 0) {
            contents.push(lines[0].slice(2));
          }
        }
      }
      return contents;
    }
    const text = await response.text();
    throw Error(`Failed to get latest channel messages from Discord: ${text} (${response.status})`);
  } catch (e) {
    throw Error(`Failed to get latest channel messages from Discord: ${e}`);
  }
};
