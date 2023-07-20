const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move uma música na fila")
    .addIntegerOption((option) =>
      option
        .setName("musica")
        .setDescription("Número da música na fila")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("posicao")
        .setDescription("Posição para mover a música")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, guild, channel } = interaction;
    await interaction.deferReply({ ephemeral: false });

    const embed = new EmbedBuilder();
    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return interaction.editReply({ embeds: [embed] });
    }

    const tracks = interaction.options.getInteger("musica");
    const position = interaction.options.getInteger("posicao");

    const queue = distube.getQueue(interaction);
    if (!queue) return interaction.editReply(`Queue | Não há músicas na fila.`);

    if (tracks == 0)
      return interaction.editReply(
        `Não é possível mover uma música que já está tocando.`
      );
    if (position == 0)
      return interaction.editReply(
        `Não é possível mover uma música para a posição 0.`
      );
    if (tracks > queue.songs.length - 1)
      return interaction.editReply(`Queue | Música não encontrada.`);
    if (position > queue.songs.length - 1)
      return interaction.editReply(`Position | Música não encontrada.`);

    try {
      const song = queue.songs[tracks];
      await queue.songs.splice(tracks, 1);
      await queue.addToQueue(song, position);

      const embed = new EmbedBuilder()
        .setDescription(
          `**Moveu • [${song.name}](${song.url})** para ${position}`
        )
        .setColor(0x2fd193);

      interaction.editReply({
        embeds: [embed],
        ephemeral: false,
      });
      setTimeout(() => interaction.deleteReply(), 5000);
    } catch (error) {
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao pular a música");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
