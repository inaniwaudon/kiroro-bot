import { getLatestDiscordMessageContents } from './api/discord';
import { postToChatGpt } from './api/gpt';
import { Bindings } from './bindings';

const PAST_CONVERSATION_LENGTH = 2;

export const createResponseMessage = async (interaction: any, env: Bindings) => {
  const input: string = interaction.data.options.find(
    (option: any) => option.name == 'content',
  ).value;
  const bannedUsernames = env.BANNED_USERS ? env.BANNED_USERS.split(',') : [];

  // response
  const rapidFire = input.match(/(.+?)([0-9]+)連射/);
  let response: string;

  // display banned users
  if (input.includes('BAN')) {
    response =
      bannedUsernames.length > 0
        ? `キロロ寿司と${bannedUsernames.join('と')}が嫌いキロ`
        : 'キロロはみんなのこと大好きキロ〜';
  }
  // rapid fire
  else if (rapidFire) {
    response = [...Array(parseInt(rapidFire[2]))].map((_) => rapidFire[1]).join('\n');
  } else {
    // called from a banned user
    if (bannedUsernames.includes(interaction.member.user.username)) {
      response = '心無い利用者に返す言葉はないキロ';
    }
    // gpt
    else {
      let latestContents: string[] = [];
      if (interaction.channel_id) {
        latestContents = (
          await getLatestDiscordMessageContents(
            interaction.channel_id,
            PAST_CONVERSATION_LENGTH * 5,
            env,
          )
        )
          .slice(0, PAST_CONVERSATION_LENGTH)
          .reverse();
      }
      response = await postToChatGpt([...latestContents, input], env.OPEN_API_KEY);
    }
  }
  return `> ${input}\n${response}`;
};
