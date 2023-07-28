import { KIRO_COMMAND } from './commands.js';
import fetch from 'node-fetch';

const token = process.env.DISCORD_BOT_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error('DISCORD_BOT_TOKEN is undefined.');
}
if (!applicationId) {
  throw new Error('DISCORD_APPLICATION_ID is undefined.');
}

const registerCommands = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify([KIRO_COMMAND]),
  });

  if (response.ok) {
    console.log('Registered all commands');
  } else {
    console.error('Error registering commands');
    const text = await response.text();
    console.error(text);
  }
  return response;
};

const registerGlobalCommands = async () => {
  const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
  await registerCommands(url);
};

await registerGlobalCommands();
