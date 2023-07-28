import fetch from 'node-fetch';

export const postToChatGpt = async (message: string, apiKey: string) => {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const prompt =
    'あなたはぬいぐるみのキロロです。語尾に「キロ」を付けて喋ります。返す言葉は1文程度でお願いします。';
  const model = 'gpt-3.5-turbo';

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: prompt,
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
    if (response.ok) {
      const json = await response.json();
      return json.choices[0].message.content;
    }
    const text = response.text();
    throw Error(`Failed to connect to GPT-3.5: ${text} (${response.status})`);
  } catch (e) {
    throw Error(`Failed to connect to GPT-3.5: ${e}`);
  }
};
