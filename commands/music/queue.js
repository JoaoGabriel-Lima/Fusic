const distube = require("../../index.js");
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fila")
    .setDescription("Mostra a fila de músicas"),
  async execute(interaction) {
    const { member, guild, channel } = interaction;
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();
    const buttonNextPage = new ButtonBuilder()
      .setCustomId("nextPage")
      .setLabel("Próxima página")
      .setStyle(ButtonStyle.Secondary);
    const buttonPreviousPage = new ButtonBuilder()
      .setCustomId("previousPage")
      .setLabel("Página anterior")
      .setStyle(ButtonStyle.Secondary);

    const buttonRow = new ActionRowBuilder().addComponents(
      buttonPreviousPage,
      buttonNextPage
    );

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

    try {
      const queue = await distube.getQueue(guild);
      if (!queue) {
        embed.setTitle("Não há músicas na fila");
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      let queueEmbed = new EmbedBuilder();

      actualPage = 1;
      maxPages = Math.ceil(queue.songs.length / 10);

      queueEmbed.setTitle(`Fila de ${queue.songs.length} músicas`);
      queueEmbed.setColor(0x2fd193);
      queueEmbed.setDescription(
        `🎶 Tocando agora:\n [${queue.songs[0].name}](${
          queue.songs[0].url
        }) \n\n **🎶 Próximas músicas:** \n ${queue.songs
          .map(
            (song, id) =>
              `**${id}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
          )
          .slice((actualPage - 1) * 10 + 1, 10 * actualPage)
          .join("\n")}`
      );

      queueEmbed.setFooter({
        text: `Página ${actualPage}/${maxPages} | ${queue.songs.length} musicas na fila - ${queue.formattedDuration}`,
      });

      const response = await interaction.reply({
        embeds: [queueEmbed],
        components: [buttonRow],
        ephemeral: true,
      });
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (button) => {
        const option = button.customId;

        if (option === "nextPage") {
          if (actualPage != maxPages) {
            actualPage++;
          }
        } else if (option === "previousPage") {
          if (actualPage != 1) {
            actualPage--;
          }
        } else {
          return;
        }
        queueEmbed = new EmbedBuilder();
        queueEmbed.setTitle(`Fila de ${queue.songs.length} músicas`);
        queueEmbed.setColor(0x2fd193);

        slicePageFirst = (actualPage - 1) * 10;
        if (actualPage == 1) {
          slicePageFirst += 1;
        }

        queueEmbed.setDescription(
          `🎶 Tocando agora:\n [${queue.songs[0].name}](${
            queue.songs[0].url
          }) \n\n **🎶 Próximas músicas:** \n ${queue.songs
            .map(
              (song, id) =>
                `**${id}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
            )
            .slice(slicePageFirst, 10 * actualPage)
            .join("\n")}`
        );

        queueEmbed.setFooter({
          text: `Página ${actualPage}/${maxPages} | ${queue.songs.length} musicas na fila - ${queue.formattedDuration}`,
        });

        await button.update({
          embeds: [queueEmbed],
          components: [buttonRow],
          ephemeral: true,
        });
      });
    } catch (error) {
      console.log(error);
      const embed = new EmbedBuilder();
      embed.setTitle("Ocorreu um erro ao mostrar a fila de músicas");
      embed.setColor(0xd12f2f);
      embed.setDescription(error.message);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
