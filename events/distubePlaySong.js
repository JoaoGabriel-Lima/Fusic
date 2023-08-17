const distube = require("../index.js");
const nodeHtmlToImage = require("node-html-to-image");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

async function customImage(nowTrack) {
  // const test = _arrayBufferToBase64(images);
  // console.log(test);

  // const newImage = nowTrack.thumbnail;
  const musicName = nowTrack.name;
  const musicAuthor = nowTrack.uploader.name;
  const musicDuration = nowTrack.formattedDuration;
  const musicURL = nowTrack.url;
  const musicPlayerURL = nowTrack.thumbnail;
  const discordUserAvatar = `https://cdn.discordapp.com/avatars/${nowTrack.user.id}/${nowTrack.user.avatar}.png`;

  await fetch(
    "https://dynamicimagebackend-production.up.railway.app/api/gerar-imagem",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        musicName,
        musicAuthor,
        musicDuration,
        musicURL,
        musicPlayerURL,
        discordUserAvatar,
      }),
    }
  );
  const rand = Math.random().toString(36).slice(2);
  const newImage = `https://dynamicimagebackend-production.up.railway.app/image.png?${rand}`;

  return newImage;
}

async function disspace(nowQueue, nowTrack) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Tocando Agora...`,
      iconURL: "https://cdn.discordapp.com/emojis/741605543046807626.gif",
    })
    .setImage((await customImage(nowTrack)) || nowTrack.thumbnail)
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
        .setCustomId("previous")
        .setEmoji("<:Retroceder:1141807767124971587>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("pause")
        .setEmoji("<:TocarPausar:1141807768735584266>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("skip")
        .setEmoji("<:Avancar:1141807751899643924>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji("<:Parar:1141807762725159075>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setEmoji("<:Repetir:1141807764562264234>")
        .setStyle(ButtonStyle.Success)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setEmoji("<:Misturar:1141807759965294663>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("voldown")
        .setEmoji("<:Menosvolume:1141807757993988097>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("volup")
        .setEmoji("<:Maisvolume:1141807757113171988>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("clear")
        .setEmoji("<:Limpar:1141807754449793034>")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("autoplay")
        .setEmoji("<:Autoplay:1141807750645559316>")
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
    "https://cdn.discordapp.com/attachments/1131702965586116719/1141546366124965898/Parado.png"
  );
  embed.setFooter({
    text: "Participe de um canal de voz e organize músicas por nome ou url aqui.",
  });

  static = await queue.textChannel.send({
    embeds: [embed],
  });

  playing.push(static);
};
global.sendExitMsg = sendExitMsg;

distube.on("playSong", async (queue, track) => {
  if (playing.length > 0) {
    playing.forEach(async (message) => {
      await message.delete();
    });
  }
  playing = [];

  var newQueue = distube.getQueue(queue.id);
  var data = await disspace(newQueue, track);

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
    } else if (id === "autoplay") {
      if (!queue) {
        collector.stop();
      }
      const autoplay = queue.toggleAutoplay();
      if (autoplay) {
        message.reply({
          content: "`🎶 Modo autoplay ativado`",
          ephemeral: true,
        });

        setTimeout(() => {
          try {
            message.deleteReply();
          } catch (error) {
            return null;
          }
        }, 5000);
      } else {
        message.reply({
          content: "`🎶 Modo autoplay desativado`",
          ephemeral: true,
        });

        setTimeout(() => {
          try {
            message.deleteReply();
          } catch (error) {
            return null;
          }
        }, 5000);
      }
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
distube.on("disconnect", async (queue) => {
  console.log("Oiii");
  await sendExitMsg(queue);
});
