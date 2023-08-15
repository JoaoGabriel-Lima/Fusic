const {
  SlashCommandBuilder,

  EmbedBuilder,
} = require("discord.js");

const distube = require("../../index.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tocar")
    .setDescription("Toca uma música")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Nome/URL da música para tocar")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    const { options, member, guild, channel } = interaction;

    let query = options.getString("query");
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();
    if (!voiceChannel) {
      embed.setTitle("Você precisa estar em um canal de voz");
      embed.setColor(0xd12f2f);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply();
    if (query.includes("spotify")) {
      linkSeparado = query.split("/");
      if (linkSeparado[3].includes("intl")) {
        if (linkSeparado[4].includes("track")) {
          query = `https://open.spotify.com/track/${linkSeparado[5]}`;
        }
        if (linkSeparado[4].includes("playlist")) {
          query = `https://open.spotify.com/playlist/${linkSeparado[5]}`;
        }
        if (linkSeparado[4].includes("album")) {
          query = `https://open.spotify.com/album/${linkSeparado[5]}`;
        }
      }
    }

    try {
      let rawdata = fs.readFileSync("settings.json");
      let settings = JSON.parse(rawdata);

      let volume = undefined;
      for (let i = 0; i < settings.length; i++) {
        if (settings[i].guild == guild.id) {
          volume = settings[i].volume;
        }
      }

      await distube.play(voiceChannel, query, {
        textChannel: channel,
        member: member,
      });
      const queue = distube.getQueue(guild);
      if (volume != undefined || !queue) {
        await queue.setVolume(volume);
      }
      await interaction.editReply({
        content: "`🎶 Pedido recebido`",
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
      embed.setTitle("Ocorreu um erro ao tocar a música");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
