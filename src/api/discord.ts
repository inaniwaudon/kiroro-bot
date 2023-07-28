import fetch from 'node-fetch';

const discordEndpoint = 'https://discord.com/api/v10';
const DEAFULT_MESSAGE_TYPE = 0;

type snowflake = number;

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

export const getLatestDiscordMessage = async (
  channelId: string,
  limit: number,
  token: string,
): Promise<DiscordMessage[]> => {
  const params = new URLSearchParams({ limit: limit.toString() }).toString();
  const endpoint = `${discordEndpoint}/channels/${channelId}/messages?${params}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
    if (response.ok) {
      const json = (await response.json()) as DiscordMessage[];
      return json.filter((message) => !message.author.bot && message.type === DEAFULT_MESSAGE_TYPE);
    }
    const text = await response.text();
    throw Error(`Failed to get latest channel messages from Discord: ${text} (${response.status})`);
  } catch (e) {
    throw Error(`Failed to get latest channel messages from Discord: ${e}`);
  }
};
