const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sair")
    .setDescription("Sai do canal de voz"),
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
      try {
        await distube.voices.leave(guild);
        // guild.me.voice.channel.leave();
      } catch (e) {
        console.log(e);
        return null;
      }
      embed.setTitle("Não há músicas na fila");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await queue.stop();
      // disconnect from voice channel
      await distube.voices.leave(guild);
      global.sendExitMsg(queue);
      queue.voice.leave();
      interaction.reply({
        content: "`🎶 Fusen saiu do canal de voz`",
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
