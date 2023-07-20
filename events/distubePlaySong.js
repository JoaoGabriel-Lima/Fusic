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
    .setThumbnail(nowTrack.thumbnail)
    .setColor("#000001")
    .setDescription(`**[${nowTrack.name}](${nowTrack.url})**`)
    .addFields({
      name: `Por:`,
      value: `**[${nowTrack.uploader.name}](${nowTrack.uploader.url})**`,
      inline: true,
    })
    .addFields({ name: `Requester:`, value: `${nowTrack.user}`, inline: true })
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
      value: `${nowQueue.autoplay ? "Activated" : "Not Active"}`,
      inline: true,
    })
    .addFields({
      name: `Duração Total:`,
      value: `${nowQueue.formattedDuration}`,
      inline: true,
    })
    .addFields({
      name: `Duração Atual: \`[0:00 / ${nowTrack.formattedDuration}]\``,
      value: `\`\`\`🔴 | 🎶──────────────────────────────\`\`\``,
      inline: false,
    })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("pause")
        .setLabel(`Pausar`)
        .setEmoji("⏯")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel(`Anterior`)
        .setEmoji("⬅")
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("stop")
        .setLabel(`Parar`)
        .setEmoji("✖")
        .setStyle(ButtonStyle.Danger)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("skip")
        .setLabel(`Pular`)
        .setEmoji("➡")
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setLabel(`Loop`)
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Success)
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setLabel(`Shuffle`)
        .setEmoji(`🔀`)
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("voldown")
        .setLabel(`Vol -`)
        .setEmoji(`🔉`)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("clear")
        .setLabel(`Limpar`)
        .setEmoji(`🗑`)
        .setStyle(ButtonStyle.Secondary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("volup")
        .setLabel(`Vol +`)
        .setEmoji(`🔊`)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("queue")
        .setLabel(`Fila`)
        .setEmoji(`📋`)
        .setStyle(ButtonStyle.Primary)
    );

  return {
    embeds: [embed],
    components: [row, row2],
  };
}

distube.on("playSong", async (queue, track) => {
  var newQueue = distube.getQueue(queue.id);
  var data = disspace(newQueue, track);

  const nowplay = await queue.textChannel.send(data);

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
    time: track.duration * 1000,
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
      } else {
        await distube.pause(message.guild.id);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`⏯\` | **A música foi:** \`Pausada\``);

        message.reply({ embeds: [embed], ephemeral: true });
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
      } else {
        await distube.skip(message);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`⏭` | **A música foi:** `Pulada`");

        nowplay.edit({ components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (id === "stop") {
      if (!queue) {
        collector.stop();
      }
      await distube.voices.leave(message.guild);
      const embed = new EmbedBuilder()
        .setDescription(`\`🚫\` | **A música foi:** | \`Parada\``)
        .setColor("#000001");

      await nowplay.edit({ components: [] });
      message.reply({ embeds: [embed], ephemeral: true });
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
      } else {
        distube.setRepeatMode(message.guild.id, 0);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription(`\`🔁\` | **A música atual NÃO está em:** \`Loop\``);

        message.reply({ embeds: [embed], ephemeral: true });
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
      } else {
        await distube.previous(message);
        const embed = new EmbedBuilder()
          .setColor("#000001")
          .setDescription("`⏮` | **Tocando a música:** `Anterior`");

        await nowplay.edit({ components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
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
      nowplay.edit({ components: [] });
    }
  });
});
