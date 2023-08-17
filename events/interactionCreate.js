const { Events, InteractionType } = require("discord.js");
const ytsr = require("@distube/ytsr");
const { SEARCH_DEFAULT } = require("../config.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      // console.error(
      //   `No command matching ${interaction.commandName} was found.`
      // );
      return;
    }

    if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
      const Random =
        SEARCH_DEFAULT[Math.floor(Math.random() * SEARCH_DEFAULT.length)];
      if (interaction.commandName == "tocar") {
        let choice = [];
        await ytsr(interaction.options.getString("query") || Random, {
          safeSearch: false,
          limit: 10,
        }).then((result) => {
          result.items.forEach((x) => {
            choice.push({ name: x.name, value: x.url });
          });
        });
        return await interaction.respond(choice).catch(() => {});
      }
    }
    try {
      if (!interaction.isChatInputCommand()) return;
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  },
};
