const distube = require("../index.js");
const { EmbedBuilder } = require("discord.js");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

distube
  .on("addSong", async (queue, song) => {
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
    queue.textChannel
      .send({ embeds: [embed] })
      .then((msg) => {
        delay(5000)
          .then(() => msg.delete())
          .catch((error) => null);
      })
      .catch((error) => null);
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
  .on("empty", async (channel) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Canal vazio");
    embed.setDescription("Ninguém está no canal de voz, saindo...");
    channel.textChannel
      .send({ embeds: [embed] })
      .then((msg) => {
        delay(5000)
          .then(() => msg.delete())
          .catch((error) => null);
      })
      .catch((error) => null);
    // global.sendExitMsg(channel);
  })
  .on("addList", async (queue, playlist) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`Playlist adicionada`);
    embed.setColor(0x2fd193);
    embed.setDescription(`Playlist \`${playlist.name}\` adicionada à fila`);
    // console.log(playlist);
    queue.textChannel
      .send({ embeds: [embed] })
      .then((msg) => {
        delay(5000)
          .then(() => msg.delete())
          .catch((error) => null);
      })
      .catch((error) => null);
  });
