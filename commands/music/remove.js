const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const distube = require("../../index.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remover")
    .setDescription("Remove uma música da fila")
    .addIntegerOption((option) =>
      option
        .setName("posicao")
        .setDescription("Posição para remover a música")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { member, guild, channel } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder();
    if (!member.voice.channelId === guild.members.me.voice.channelId) {
      embed.setTitle(
        `Você não pode usar um comando de música em um canal diferente do meu <#${guild.members.me.voice.channelId}>`
      );
      embed.setColor(0xd12f2f);
      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    const position = interaction.options.getInteger("posicao");

    const queue = distube.getQueue(interaction);
    if (!queue) return interaction.editReply(`Queue | Não há músicas na fila.`);

    if (position == 0)
      return interaction.editReply(
        `Não é possível remover uma música na posição 0.`
      );

    if (position > queue.songs.length - 1)
      return interaction.editReply(`Position | Música não encontrada.`);

    try {
      const song = queue.songs[position];
      await queue.songs.splice(position, 1);

      const embed = new EmbedBuilder()
        .setDescription(`**Removeu • [${song.name}](${song.url})**`)
        .setColor(0x2fd193);

      interaction.editReply({
        embeds: [embed],
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
