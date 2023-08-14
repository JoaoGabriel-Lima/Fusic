const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Altera o volume da música atual")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("O volume da música atual de 0 a 100")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, guild, channel } = interaction;

    const embed = new EmbedBuilder();
    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return interaction.reply({ embeds: [embed] });
    }

    if (
      !interaction.options.getInteger("volume") ||
      interaction.options.getInteger("volume") > 300 ||
      interaction.options.getInteger("volume") < 0
    ) {
      embed.setTitle("Você não especificou o volume");
      embed.setColor(0xd12f2f);
      return interaction.reply({ embeds: [embed] });
    }

    const queue = distube.getQueue(guild);
    const volume = interaction.options.getInteger("volume");

    if (!queue) {
      embed.setTitle("Não há músicas na fila");
      return interaction.reply({ embeds: [embed] });
    }

    try {
      await queue.setVolume(volume);

      let rawdata = fs.readFileSync("settings.json");
      let settings = JSON.parse(rawdata);

      let achou = false;
      settings.forEach((guilda) => {
        if (guilda.guild == guild.id) {
          achou = true;
          guilda.volume = volume;
        }
      });
      if (!achou) {
        settings.push({
          guild: guild.id,
          channel: "",
          volume: volume,
        });
      }

      fs.writeFileSync("settings.json", JSON.stringify(settings));

      interaction.reply({
        content:
          "`🎶 Volume alterado para " +
          interaction.options.getInteger("volume") +
          "`",
        ephemeral: true,
      });

      setTimeout(() => {
        try {
          interaction.deleteReply();
        } catch (error) {
          return null;
        }
      }, 5000);
    } catch (error) {
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao alterar o volume");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
