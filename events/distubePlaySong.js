const distube = require("../index.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

const status = {
  paused: false,
  loop: false,
  autoplay: false,
};

global.statusObject = status;

async function customImage(nowTrack, message) {
  // const test = _arrayBufferToBase64(images);
  // console.log(test);

  // const newImage = nowTrack.thumbnail;
  const musicName = nowTrack.name;
  const musicAuthor = nowTrack.uploader.name;
  const musicDuration = nowTrack.formattedDuration;
  const musicURL = nowTrack.url;
  const musicPlayerURL = nowTrack.thumbnail;
  const discordUserAvatar = `https://cdn.discordapp.com/avatars/${nowTrack.user.id}/${nowTrack.user.avatar}.png`;

  try {
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

    // get the embed from the message, and update the image, and update the message

    let embed = message.embeds[0];

    embed.data.image = {
      url: newImage,
      width: 1280,
      height: 720,
    };
    await message.edit({ embeds: [embed] });

    return newImage;
  } catch (error) {
    return null;
  }
}

const updateRows = () => {
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
        .setStyle(
          global.statusObject.paused
            ? ButtonStyle.Secondary
            : ButtonStyle.Success
        )
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
        .setStyle(
          global.statusObject.loop ? ButtonStyle.Success : ButtonStyle.Secondary
        )
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
        .setStyle(
          global.statusObject.autoplay
            ? ButtonStyle.Success
            : ButtonStyle.Secondary
        )
    );
  return [row, row2];
};

global.updateRows = updateRows;

async function disspace(nowQueue, nowTrack) {
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
    });

  return {
    embeds: [embed],
    components: updateRows(),
  };
}

let playing = [];

const sendExitMsg = async (queue) => {
  if (playing.length > 0) {
    playing.forEach(async (message) => {
      try {
        await message.delete();
      } catch (error) {
        return null;
      }
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
      try {
        await message.delete();
      } catch (error) {
        return null;
      }
    });
  }
  playing = [];

  var newQueue = distube.getQueue(queue.id);

  global.statusObject.paused = newQueue.paused;
  global.statusObject.loop = newQueue.repeatMode === 1 ? true : false;
  global.statusObject.autoplay = newQueue.autoplay;

  var data = await disspace(newQueue, track);

  const nowplay = await queue.textChannel.send(data);
  global.nowplay = nowplay;
  playing.push(nowplay);
  customImage(track, nowplay);

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
        global.statusObject.paused = false;
        await distube.resume(message.guild.id);
        // inscrese collector time
        collector.resetTimer({
          time: (track.duration - queue.currentTime) * 990,
        });

        nowplay.edit({ components: updateRows() });

        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`⏯\` | **A música foi:** \`Despausada\``);
        message.reply({ embeds: [embed], ephemeral: true });
        message.deleteReply();
        // setTimeout(() => {
        //   message.deleteReply();
        // }, 5000);
      } else {
        await distube.pause(message.guild.id);
        // inscrese collector time
        collector.resetTimer({ time: 1000000 });
        global.statusObject.paused = true;
        // edit nowplay message to change the pause button color

        nowplay.edit({ components: updateRows() });

        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`⏯\` | **A música foi:** \`Pausada\``);

        message.reply({ embeds: [embed], ephemeral: true });
        message.deleteReply();
        // setTimeout(() => {
        //   message.deleteReply();
        // }, 5000);
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
        global.statusObject.loop = true;
        nowplay.edit({ components: updateRows() });
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`🔁\` | **A música atual está em:** \`Loop\``);

        // message.reply({ embeds: [embed], ephemeral: true });
        // setTimeout(() => {
        //   message.deleteReply();
        // }, 5000);
        message.reply({ embeds: [embed], ephemeral: true });
        message.deleteReply();
      } else {
        distube.setRepeatMode(message.guild.id, 0);
        global.statusObject.loop = false;
        nowplay.edit({ components: updateRows() });
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`🔁\` | **A música atual NÃO está em:** \`Loop\``);

        // message.reply({ embeds: [embed], ephemeral: true });
        // setTimeout(() => {
        //   message.deleteReply();
        // }, 5000);

        // reply null
        message.reply({ embeds: [embed], ephemeral: true });
        message.deleteReply();
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
      const volume = queue.volume - 5;
      await distube.setVolume(message, volume);
      try {
        let rawdata = fs.readFileSync("settings.json");
        let settings = JSON.parse(rawdata);

        let achou = false;
        const guild = message.guild;
        settings.forEach((guilda) => {
          if (guilda.guild == guild.id) {
            achou = true;
            guilda.volume = volume;
          }
        });
        if (!achou) {
          settings.push({
            guild: guild.id,
            channel: "",
            volume: volume,
          });
        }

        fs.writeFileSync("settings.json", JSON.stringify(settings));
      } catch (error) {
        console.log(error);
        return null;
      }
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
      const volume = queue.volume + 5;
      await distube.setVolume(message, volume);
      try {
        let rawdata = fs.readFileSync("settings.json");
        let settings = JSON.parse(rawdata);

        let achou = false;
        const guild = message.guild;
        settings.forEach((guilda) => {
          if (guilda.guild == guild.id) {
            achou = true;
            guilda.volume = volume;
          }
        });
        if (!achou) {
          settings.push({
            guild: guild.id,
            channel: "",
            volume: volume,
          });
        }

        fs.writeFileSync("settings.json", JSON.stringify(settings));
      } catch (error) {
        console.log(error);
        return null;
      }
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
        global.statusObject.autoplay = true;
        nowplay.edit({ components: updateRows() });
        message.reply({
          content: "`🎶 Modo autoplay ativado`",
          ephemeral: true,
        });
        message.deleteReply();

        // setTimeout(() => {
        //   try {
        //     message.deleteReply();
        //   } catch (error) {
        //     return null;
        //   }
        // }, 5000);
      } else {
        global.statusObject.autoplay = false;
        nowplay.edit({ components: updateRows() });
        message.reply({
          content: "`🎶 Modo autoplay desativado`",
          ephemeral: true,
        });
        message.deleteReply();

        // setTimeout(() => {
        //   try {
        //     message.deleteReply();
        //   } catch (error) {
        //     return null;
        //   }
        // }, 5000);
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
  await sendExitMsg(queue);
});
