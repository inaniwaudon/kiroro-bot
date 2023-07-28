import fetch from 'node-fetch';

const discordEndpoint = 'https://discord.com/api/v10';

type snowflake = number;

interface DiscordMessage {
  id: snowflake;
  channel_id: snowflake;
  author: DiscordUser;
  content: string;
  timestamp: string;
}

interface DiscordUser {
  id: snowflake;
  username: string;
  discriminator: string;
  global_name: string;
  bot: boolean;
}

export const getLatestDiscordMessage = async (channelId: string): Promise<DiscordMessage> => {
  const endpoint = `${discordEndpoint}/channels/${channelId}/messages`;
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      return await response.json();
    }
    const text = response.text();
    throw Error(`Failed to get latest channel messages from Discord: ${text} (${response.status})`);
  } catch (e) {
    throw Error(`Failed to get latest channel messages from Discord: ${e}`);
  }
};
