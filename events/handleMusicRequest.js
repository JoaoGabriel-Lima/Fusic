const { Events, Interaction, EmbedBuilder } = require("discord.js");

const distube = require("../index.js");
const fs = require("fs");

const convertLink = async (link) => {
  let query = link;
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
  return query;
};

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    text = message.content;
    const { options, member, guild, channel } = message;

    let rawdata = fs.readFileSync("settings.json");
    let settings = JSON.parse(rawdata);

    let achou = false;
    let channelID = "";
    for (let i = 0; i < settings.length; i++) {
      if (settings[i].guild == guild.id) {
        achou = true;
        channelID = settings[i].channel;
      }
    }

    if (!achou) return;
    if (channel.id != channelID) return;

    let query = text;
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();
    if (!voiceChannel) {
      embed.setTitle("Você precisa estar em um canal de voz");
      embed.setColor(0xd12f2f);
      return channel.send({ embeds: [embed] });
    }

    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return channel.send({ embeds: [embed] });
    }

    // await interaction.deferReply();

    query = await convertLink(query);

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

      // const msg = await channel.send({
      //   content: "`🎶 Pedido recebido`",
      //   ephemeral: false,
      // });
      // // remove the message after 5 seconds
      //   setTimeout(() => {
      // try {
      //     msg.delete();
      // } catch (error) {
      //   return null;
      // }
      //   }, 5000);
    } catch (error) {
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao tocar a música");
      console.log(error);
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      const msg = await channel.send({
        embeds: [embed],
        ephemeral: true,
      });
      try {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      } catch (error) {
        return null;
      }
    }
    message.delete();
  },
};
