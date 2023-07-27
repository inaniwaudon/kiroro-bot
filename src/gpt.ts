import fetch from 'node-fetch';

const endpoint = 'https://api.openai.com/v1/chat/completions';

export const postToChatGpt = async (message: string, apiKey: string) => {
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'あなたはぬいぐるみのキロロです。語尾に「キロ」を付けて喋ります。返す言葉は1文程度でお願いします。',
      },
      {
        role: 'user',
        content: message.slice(0, 30),
      },
    ],
    max_tokens: 40,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw Error(`Failed to connect to GPT 3.5: ${response.status}`);
    }
    const json = await response.json();
    return json.choices[0].message.content;
  } catch (e) {
    throw Error(`Failed to connect to GPT 3.5: ${e}`);
  }
};
