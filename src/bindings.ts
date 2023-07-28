import { D1Database } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_BOT_TOKEN: string;
  OPEN_API_KEY: string;
  KIRORO_ID: string;
  BANNED_USERS?: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
