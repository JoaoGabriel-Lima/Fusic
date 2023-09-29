const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Ativa ou desativa o modo autoplay"),
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
      const autoplay = queue.toggleAutoplay();
      if (autoplay) {
        interaction.reply({
          content: "`🎶 Modo autoplay ativado`",
          ephemeral: true,
        });
        global.statusObject.autoplay = true;
        global.nowplay.edit({
          components: global.updateRows(),
        });

        setTimeout(() => {
          try {
            interaction.deleteReply();
          } catch (error) {
            return null;
          }
        }, 5000);
      } else {
        interaction.reply({
          content: "`🎶 Modo autoplay desativado`",
          ephemeral: true,
        });
        global.statusObject.autoplay = false;
        global.nowplay.edit({
          components: global.updateRows(),
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
      embed.setTitle("Ocorreu um erro ao ativar/desativar o modo autoplay");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
