const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Repete a música atual ou a fila de músicas")
    .addStringOption((option) =>
      option
        .setName("modo")
        .setDescription("O modo de repetição")
        .setRequired(true)
        .addChoices(
          { name: "Música", value: "1" },
          { name: "Fila", value: "2" },
          { name: "Desativado", value: "0" }
        )
    ),
  async execute(interaction) {
    const { member, guild, channel } = interaction;

    const embed = new EmbedBuilder();
    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const queue = distube.getQueue(guild);
    if (!queue) {
      embed.setTitle("Não há músicas na fila");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const mode = interaction.options.getString("modo");

    try {
      await queue.setRepeatMode(parseInt(mode));
      if (mode == "0") {
        interaction.reply({
          content: "`🎶 O modo de loop foi desativado`",
          ephemeral: true,
        });
      }
      if (mode == "1") {
        interaction.reply({
          content: "`🎶 O modo de loop vai repetir a música atual`",
          ephemeral: true,
        });
      }
      if (mode == "2") {
        interaction.reply({
          content: "`🎶 O modo de loop vai repetir a fila`",
          ephemeral: true,
        });
      }
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
