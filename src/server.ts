import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { Hono } from 'hono';
import { Bindings } from './bindings';
import { KIRO_COMMAND } from './commands';
import { postToChatGpt } from './gpt';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  console.log(c);
  return c.text(`Hello ${c.env!.DISCORD_APPLICATION_ID}`);
});

app.post('/', async (c) => {
  // verify
  const signature = c.req.header('x-signature-ed25519');
  const timestamp = c.req.header('x-signature-timestamp');
  const body = await c.req.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY as string);
  if (!isValidRequest) {
    return c.text('Bad request signature.', 401);
  }

  const interaction = JSON.parse(body);
  if (!interaction) {
    return c.text('Bad request signature.', 401);
  }

  // interact
  if (interaction.type === InteractionType.PING) {
    return c.json({
      type: InteractionResponseType.PONG,
    });
  }

  const bannedUsernames = (c.env.BANNED_USERS ?? '').split(',');

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    switch (interaction.data.name.toLowerCase()) {
      case KIRO_COMMAND.name.toLowerCase(): {
        const message = interaction.data.options.find(
          (option: any) => option.name == 'content',
        ).value;
        try {
          // response
          const rapidFire = message.match(/(.+?)([0-9]+)連射/);
          let response: string;

          if (message.includes('BAN')) {
            // display banned users
            response = `キロロ寿司と${bannedUsernames.join('と')}が嫌いキロ`;
          } else if (rapidFire) {
            // rapid fire
            response = [...Array(parseInt(rapidFire[2]))].map((_) => rapidFire[1]).join('\n');
          } else {
            if (bannedUsernames.includes(interaction.member.user.username)) {
              // called from a banned user
              response = '心無い利用者に返す言葉はないキロ';
            } else {
              // gpt
              response = await postToChatGpt(message, c.env.OPEN_API_KEY);
            }
          }
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `> ${message}\n${response}`,
            },
          });
        } catch (e) {
          console.error(e);
          return c.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'OpenAI に嫌われちゃったキロ〜！！',
            },
          });
        }
      }
      default:
        return c.json({ error: 'Unknown Type' }, 400);
    }
  }

  console.error('Unknown Type');
  return c.json({ error: 'Unknown Type' }, 400);
});

app.fire();

export default app;
