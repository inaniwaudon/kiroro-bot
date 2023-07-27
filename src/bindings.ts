export type Bindings = {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  DISCORD_TEST_GUILD_ID: string;
  OPEN_API_KEY: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
