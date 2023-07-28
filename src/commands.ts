import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';

export const KIRO_COMMAND: RESTPostAPIChatInputApplicationCommandsJSONBody = {
  name: 'kiro',
  description: 'キロロとお話するキロ〜',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'content',
      description: 'キロキロ',
      required: true,
    },
  ],
};
