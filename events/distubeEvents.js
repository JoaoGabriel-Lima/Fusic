const distube = require("../index.js");
const { EmbedBuilder } = require("discord.js");

distube
  // .on("playSong", (queue, song) => {
  //   const embed = new EmbedBuilder()
  //     .setAuthor({
  //       name: `Starting Playing...`,
  //       iconURL: "https://cdn.discordapp.com/emojis/741605543046807626.gif",
  //     })
  //     .setThumbnail(song.thumbnail)
  //     .setColor("#000001")
  //     .setDescription(`**[${song.name}](${song.url})**`)
  //     .addFields({
  //       name: `Uploader:`,
  //       value: `**[${song.uploader.name}](${song.uploader.url})**`,
  //       inline: true,
  //     })
  //     .addFields({ name: `Requester:`, value: `${song.user}`, inline: true })
  //     .addFields({
  //       name: `Current Volume:`,
  //       value: `${queue.volume}%`,
  //       inline: true,
  //     })
  //     .addFields({
  //       name: `Filters:`,
  //       value: `${queue.filters.names.join(", ") || "Normal"}`,
  //       inline: true,
  //     })
  //     .addFields({
  //       name: `Autoplay:`,
  //       value: `${queue.autoplay ? "Activated" : "Not Active"}`,
  //       inline: true,
  //     })
  //     .addFields({
  //       name: `Total Duration:`,
  //       value: `${queue.formattedDuration}`,
  //       inline: true,
  //     })
  //     .addFields({
  //       name: `Current Duration: \`[0:00 / ${song.formattedDuration}]\``,
  //       value: `\`\`\`🔴 | 🎶──────────────────────────────\`\`\``,
  //       inline: false,
  //     })
  //     .setTimestamp();

  //   queue.textChannel.send({ embeds: [embed] }).then((msg) => {
  //     setTimeout(() => msg.delete(), song.duration * 1000);
  //   });
  // })
  .on("finish", (queue) => {
    const embed = new EmbedBuilder();
    embed.setDescription("Não há mais músicas na fila");
    queue.textChannel.send({ embeds: [embed] });
  })
  .on("addSong", (queue, song) => {
    const embed = new EmbedBuilder();

    embed.setAuthor({
      name: `${
        song.name.split("-")[0]?.trim() ||
        song.name.split("–")[0]?.trim() ||
        song.name
      }`,
      url: song.url,
    });
    // set title with split after index 0 to get rid of the artist name
    embed.setTitle(
      song.name.split("-").slice(1).join("-").trim() ||
        song.name.split("–").slice(1).join("–").trim() ||
        song.name
    );
    embed.setColor(0x2fd193);
    embed.setThumbnail(song.thumbnail);
    embed.setDescription(`Pedido por ${song.user}`);
    embed.setFooter({
      text: `Duração: ${song.formattedDuration} | Posição na fila: ${
        queue.songs.length - 1
      }`,
    });
    queue.textChannel.send({ embeds: [embed] });
  })
  .on("error", (channel, error) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Ocorreu um erro");
    embed.setDescription(error);
    channel.send({ embeds: [embed] });
  })
  .on("searchNoResult", (message, query) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Nenhum resultado encontrado");
    embed.setDescription(`Não foi encontrado nenhum resultado para ${query}`);
    message.channel.send({ embeds: [embed] });
  })
  .on("empty", (channel) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Canal vazio");
    embed.setDescription("Ninguém está no canal de voz, saindo...");
    channel.send({ embeds: [embed] });
  })
  .on("addList", (queue, playlist) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`Playlist adicionada`);
    embed.setColor(0x2fd193);
    embed.setDescription(`Playlist \`${playlist.name}\` adicionada à fila`);
    // console.log(playlist);
    queue.textChannel.send({ embeds: [embed] });
  });
