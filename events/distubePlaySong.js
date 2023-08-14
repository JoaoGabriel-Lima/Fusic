const distube = require("../index.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

function disspace(nowQueue, nowTrack) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Tocando Agora...`,
      iconURL: "https://cdn.discordapp.com/emojis/741605543046807626.gif",
    })
    .setImage(nowTrack.thumbnail)
    .setColor("#00F090")
    .setDescription(`**[${nowTrack.name}](${nowTrack.url})**`)
    .addFields({
      name: `Canal:`,
      value: `**[${nowTrack.uploader.name}](${nowTrack.uploader.url})**`,
      inline: true,
    })
    .addFields({ name: `Pedido por:`, value: `${nowTrack.user}`, inline: true })
    .addFields({
      name: `Volume Atual:`,
      value: `${nowQueue.volume}%`,
      inline: true,
    })
    .addFields({
      name: `Filtros:`,
      value: `${nowQueue.filters.names.join(", ") || "Normal"}`,
      inline: true,
    })
    .addFields({
      name: `Autoplay:`,
      value: `${nowQueue.autoplay ? "Ativado" : "Desativado"}`,
      inline: true,
    })
    .addFields({
      name: `Duração Total:`,
      value: `${nowQueue.formattedDuration}`,
      inline: true,
    })
    // .addFields({
    //   name: `Duração Atual: \`[0:00 / ${nowTrack.formattedDuration}]\``,
    //   value: `\`\`\`🔴 | 🎶──────────────────────────────\`\`\``,
    //   inline: false,
    // })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("pause")
        .setEmoji("<:PlayPause:1131698276572340235>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:Backward:1131698269882433536>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji("<:Stop:1131698282331119666>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("skip")
        .setEmoji("<:Forward:1131698273011376209>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setEmoji("<:Loop:1131698274399699085>")
        .setStyle(ButtonStyle.Success)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setEmoji("<:Shuffle:1131698279353155704>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("voldown")
        .setEmoji("<:VolumeSmall:1131698291273371678>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("clear")
        .setEmoji("<:ClearList:1131698271044243578>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("volup")
        .setEmoji("<:VolumeLoud:1131698283589402784>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("queue")
        .setEmoji("<:Queue:1131698278182944780>")
        .setStyle(ButtonStyle.Success)
    );

  return {
    embeds: [embed],
    components: [row, row2],
  };
}

let playing = [];

const sendExitMsg = async (queue) => {
  if (playing.length > 0) {
    playing.forEach(async (message) => {
      await message.delete();
    });
  }
  playing = [];
  const embed = new EmbedBuilder();
  embed.setTitle("Não há músicas na fila");
  embed.setColor(0x00f090);
  embed.setImage(
    "https://cdn.discordapp.com/attachments/1131702965586116719/1140736476242522384/Sem_musicas.jpg"
  );
  embed.setFooter({
    text: "Participe de um canal de voz e organize músicas por nome ou url aqui.",
  });

  static = await queue.textChannel.send({
    embeds: [embed],
  });

  playing.push(static);
};

distube.on("playSong", async (queue, track) => {
  if (playing.length > 0) {
    playing.forEach(async (message) => {
      await message.delete();
    });
  }
  playing = [];

  var newQueue = distube.getQueue(queue.id);
  var data = disspace(newQueue, track);

  const nowplay = await queue.textChannel.send(data);
  playing.push(nowplay);

  const filter = (message) => {
    if (
      message.guild.members.me.voice.channel &&
      message.guild.members.me.voice.channelId ===
        message.member.voice.channelId
    )
      return true;
    else {
      message.reply({
        content:
          "Você não pode usar um comando de música em um canal diferente do meu.",
        ephemeral: true,
      });
    }
  };
  const collector = nowplay.createMessageComponentCollector({
    filter,
    time: track.duration * 990,
  });

  collector.on("collect", async (message) => {
    const id = message.customId;
    const queue = distube.getQueue(message.guild.id);
    if (id === "pause") {
      if (!queue) {
        collector.stop();
      }
      if (queue.paused) {
        await distube.resume(message.guild.id);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`⏯\` | **A música foi:** \`Despausada\``);

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      } else {
        await distube.pause(message.guild.id);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`⏯\` | **A música foi:** \`Pausada\``);

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      }
    } else if (id === "skip") {
      if (!queue) {
        collector.stop();
      }
      if (queue.songs.length === 1 && queue.autoplay === false) {
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`🚨` | **Não há** `Músicas` **na fila**");

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      } else {
        await distube.skip(message);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`⏭` | **A música foi:** `Pulada`");

        // nowplay.edit({ components: [] });
        // await nowplay.delete();
        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      }
    } else if (id === "stop") {
      if (!queue) {
        collector.stop();
      }
      await queue.stop();
      await sendExitMsg(queue);
      const embed = new EmbedBuilder()
        .setDescription(`\`🚫\` | **A música foi:** | \`Parada\``)
        .setColor("#000001");

      // await nowplay.edit({ components: [] });
      // await nowplay.delete();
      message.reply({ embeds: [embed], ephemeral: true });
      setTimeout(() => {
        message.deleteReply();
      }, 5000);
    } else if (id === "loop") {
      if (!queue) {
        collector.stop();
      }
      if (queue.repeatMode === 0) {
        distube.setRepeatMode(message.guild.id, 1);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`🔁\` | **A música atual está em:** \`Loop\``);

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      } else {
        distube.setRepeatMode(message.guild.id, 0);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`🔁\` | **A música atual NÃO está em:** \`Loop\``);

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      }
    } else if (id === "previous") {
      if (!queue) {
        collector.stop();
      }
      if (queue.previousSongs.length == 0) {
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`🚨` | **Não há** `músicas` **anteriores**");

        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      } else {
        await distube.previous(message);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`⏮` | **Tocando a música:** `Anterior`");

        // await nowplay.edit({ components: [] });
        // await nowplay.delete();
        message.reply({ embeds: [embed], ephemeral: true });
        setTimeout(() => {
          message.deleteReply();
        }, 5000);
      }
    } else if (id === "shuffle") {
      if (!queue) {
        collector.stop();
      }
      await distube.shuffle(message);
      const embed = new EmbedBuilder()
        .setColor(0x2fd193)
        .setDescription(`\`🔀\` | **A fila foi:** \`Embaralhada\``);

      message.reply({ embeds: [embed], ephemeral: true });
      setTimeout(() => {
        message.deleteReply();
      }, 5000);
    } else if (id === "voldown") {
      if (!queue) {
        collector.stop();
      }
      await distube.setVolume(message, queue.volume - 5);
      const embed = new EmbedBuilder()
        .setColor(0x2fd193)
        .setDescription(
          `\`🔊\` | **Diminuindo o volume para:** \`${queue.volume}\`%`
        );

      message.reply({ embeds: [embed], ephemeral: true });
      setTimeout(() => {
        message.deleteReply();
      }, 5000);
    } else if (id === "clear") {
      if (!queue) {
        collector.stop();
      }
      await queue.songs.splice(1, queue.songs.length);
      //   await client.UpdateQueueMsg(queue);

      const embed = new EmbedBuilder()
        .setDescription(`\`📛\` | **A fila foi:** \`Limpada\``)
        .setColor(0x2fd193);

      message.reply({ embeds: [embed], ephemeral: true });
      setTimeout(() => {
        message.deleteReply();
      }, 5000);
    } else if (id === "volup") {
      if (!queue) {
        collector.stop();
      }
      await distube.setVolume(message, queue.volume + 5);
      const embed = new EmbedBuilder()
        .setColor(0x2fd193)
        .setDescription(
          `\`🔊\` | **Aumentando o volume para:** \`${queue.volume}\`%`
        );

      message.reply({ embeds: [embed], ephemeral: true });
      setTimeout(() => {
        message.deleteReply();
      }, 5000);
    } else if (id === "queue") {
      if (!queue) {
        collector.stop();
      }
      const pagesNum = Math.ceil(queue.songs.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      const songStrings = [];
      for (let i = 1; i < queue.songs.length; i++) {
        const song = queue.songs[i];
        songStrings.push(
          `**${i}.** [${song.name}](${song.url}) \`[${song.formattedDuration}]\` • ${song.user}
          `
        );
      }

      const pages = [];
      for (let i = 0; i < pagesNum; i++) {
        const str = songStrings.slice(i * 10, i * 10 + 10).join("");
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `Queue - ${message.guild.name}`,
            iconURL: message.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(queue.songs[0].thumbnail)
          .setColor(0x2fd193)
          .setDescription(
            `**Tocando agora:**\n**[${queue.songs[0].name}](${
              queue.songs[0].url
            })** \`[${queue.songs[0].formattedDuration}]\` • ${
              queue.songs[0].user
            }\n\n**Resto da fila**${str == "" ? "  Nada" : "\n" + str}`
          )
          .setFooter({
            text: `Página • ${i + 1}/${pagesNum} | ${
              queue.songs.length
            } • Músicas | ${queue.formattedDuration} • Duração total`,
          });

        pages.push(embed);
      }

      message.reply({ embeds: [pages[0]], ephemeral: true });
    } else {
      return;
    }
  });
  collector.on("end", async (collected, reason) => {
    if (reason === "time") {
      await nowplay.edit({ components: [] });
      // await nowplay.delete();

      // remove nowplay message
      // if (queue.songs.length < 2) {

      // }
    }
  });
});

distube.on("finish", async (queue) => {
  await sendExitMsg(queue);
});
