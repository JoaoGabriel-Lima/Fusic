const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Embaralha a fila de músicas"),
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

    const queue = distube.getQueue(guild);

    if (!queue) {
      embed.setTitle("Não há músicas na fila");
      return interaction.reply({ embeds: [embed] });
    }
    try {
      queue.shuffle();
      interaction.reply({
        content: "`🎶 Músicas embaralhadas`",
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
      embed.setTitle("Ocorreu um erro ao embaralhar as músicas");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
