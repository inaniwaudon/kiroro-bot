import { execSync } from 'child_process';
import fetch from 'node-fetch';
import { summarizeOnepiece } from './api/gpt';

const startChapter = 1090;
const endChapter = 1090;

for (let chapter = startChapter; chapter <= endChapter; chapter++) {
  let content = '';
  try {
    const onepieceResponse = await fetch(`https://eiga-manga.com/entry/onepiece${chapter}`);
    const text = await onepieceResponse.text();
    if (!onepieceResponse.ok) {
      throw new Error(
        `Failed to load the spoiler of "one piece": ${text} (${onepieceResponse.status}`,
      );
    }
    const liList = [
      ...text
        .replace(/<div class="article_outline">([\s\S]*?)<\/div>/gm, '')
        .matchAll(/<li>(.+?)<\/li>/g),
    ];
    content = liList.map((li) => li[1].replaceAll(/(<.+?>|<\/.+?>)/g, '')).join('\n');
  } catch (e) {
    throw new Error(`Failed to load the spoiler of "one piece": ${e}`);
  }

  const summary = await summarizeOnepiece(content, process.env.OPEN_API_KEY!);
  execSync(
    `wrangler d1 execute kiroro-bot --command=\"INSERT INTO onepiece VALUES (${chapter}, \'${summary}\')\";`,
  );
}
