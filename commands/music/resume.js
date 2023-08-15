const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("despausar")
    .setDescription("Pausa/Despausa a música atual"),
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

    try {
      if (queue.paused) {
        await queue.resume();
        interaction.reply({
          content: "`🎶 Música despausada`",
          ephemeral: true,
        });

        setTimeout(() => {
          try {
            interaction.deleteReply();
          } catch (error) {
            return null;
          }
        }, 5000);
      } else {
        await queue.pause();
        interaction.reply({
          content: "`🎶 Música pausada`",
          ephemeral: true,
        });

        setTimeout(() => {
          try {
            interaction.deleteReply();
          } catch (error) {
            return null;
          }
        }, 5000);
      }
    } catch (error) {
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao pausar/despausar a música");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
