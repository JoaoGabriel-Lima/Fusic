const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Definir o canal de música para o modo sem comandos")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("O canal de música para o modo sem comandos")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, guild, channel } = interaction;

    // write channel id to file
    let rawdata = fs.readFileSync("settings.json");
    let settings = JSON.parse(rawdata);

    let achou = false;
    settings.forEach((guilda) => {
      if (guilda.guild == guild.id) {
        achou = true;
        guilda.channel = interaction.options.getChannel("channel").id;
      }
    });
    if (!achou) {
      settings.push({
        guild: guild.id,
        channel: interaction.options.getChannel("channel").id,
        volume: 50,
      });
    }

    fs.writeFileSync("settings.json", JSON.stringify(settings));

    const embed = new EmbedBuilder();

    embed.setTitle(
      `Canal de música definido para <#${
        interaction.options.getChannel("channel").id
      }>`
    );
    embed.setColor(0x2fd193);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
