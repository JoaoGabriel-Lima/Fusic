const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pula a música atual"),
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

    try {
      await distube.skip(guild);
      interaction.reply({
        content: "`🎶 Música pulada`",
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
      embed.setTitle("Ocorreu um erro ao pular a música");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
