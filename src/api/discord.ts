import fetch from 'node-fetch';
import { APIMessage, MessageType } from 'discord-api-types/v10';
import { Bindings } from '../bindings';

const discordEndpoint = 'https://discord.com/api/v10';

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
      const messages: APIMessage[] = await response.json();
      const contents: string[] = [];
      for (const message of messages) {
        // sent by other members
        if (!message.author.bot && message.type === MessageType.Default) {
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
