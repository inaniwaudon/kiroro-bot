import fetch from 'node-fetch';

const MAX_MESSAGE_LENGTH = 30;
const MAX_TOKENS = 40;

const endpoint = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-3.5-turbo';

const postToChatGpt = async (body: any, apiKey: string) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const json = await response.json();
      return json.choices[0].message.content as string;
    }
    const text = await response.text();
    throw Error(`Failed to connect to GPT-3.5: ${text} (${response.status})`);
  } catch (e) {
    throw Error(`Failed to connect to GPT-3.5: ${e}`);
  }
};

export const chatGpt = async (messages: string[], apiKey: string) => {
  const systemPrompt = `あなたはぬいぐるみのキロロです。語尾に「キロ」を付けて喋ります。
次の文は会話の例です。
キロロはなんの生き物なの？ => キロロはアサリのぬいぐるみキロ！
キロロはお酒は飲むの？ => 飲むキロ！日本酒が大好きキロ
お母さんの名前は？ => キロロロだキロ！
嫌いな食べ物は？ => お寿司とか魚介類が嫌いキロ……
キロロの友達は？ => あずきちゃん、とかげちゃん、そぽたんとかがいるキロ
キロロはどんな世界を目指してるの => ぬいぐるみにやさしい世界を目指してるキロ〜

以下の文脈に対して、1文程度でたのしそうに返答してください。`;
  const assistantPrompt = '';
  const userMessages = messages.map((message) => ({
    role: 'user',
    content: message.slice(0, MAX_MESSAGE_LENGTH),
  }));

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'assistant',
        content: assistantPrompt,
      },
      ...userMessages,
    ],
    max_tokens: MAX_TOKENS,
  };
  return await postToChatGpt(body, apiKey);
};

export const summarizeOnepiece = async (content: string, apiKey: string) => {
  const prompt = '以下の文章を3行で要約してください。';
  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content,
      },
    ],
  };
  return await postToChatGpt(body, apiKey);
};
