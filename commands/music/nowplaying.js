const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Mostra a música atual"),
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
      const song = queue.songs[0];
      const currentTime = queue.currentTime;
      const formatedCurrentTime =
        Math.trunc(currentTime.toString().split(".")[0] / 60).toLocaleString(
          "en-US",
          { minimumIntegerDigits: 2, useGrouping: false }
        ) +
        ":" +
        (currentTime.toString().split(".")[0] % 60).toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });
      const duration = song.formattedDuration;
      const percentage = currentTime / song.duration;
      //   console.log(percentage);
      const progress = Math.round(percentage * 10);
      const emptyProgress = 10 - progress;
      const progressText = "▇".repeat(progress);
      const emptyProgressText = "━".repeat(emptyProgress);
      const bar = progressText + emptyProgressText;

      //   const progressText = progressBar(progress);

      embed.setTitle(`${song.name}`);
      embed.setURL(song.url);
      embed.setThumbnail(song.thumbnail);
      embed.setDescription(`${formatedCurrentTime} ${bar} ${duration}`);
      embed.setColor(0x2fd193);
      embed.setFooter({
        text: `Duração: ${queue.formattedDuration}`,
      });

      interaction.reply({ embeds: [embed] });

      setTimeout(() => interaction.deleteReply(), 10000);
    } catch (error) {
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao mostrar a música atual");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
