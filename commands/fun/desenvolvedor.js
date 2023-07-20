const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("desenvolvedor")
    .setDescription("Detalhes sobre o desenvolvedor do bot"),
  async execute(interaction) {
    const portfolio = new ButtonBuilder()
      .setLabel("Portfólio")
      .setURL("https://joaolima.vercel.app/")
      .setStyle(ButtonStyle.Link);
    const row1 = new ActionRowBuilder().addComponents(portfolio);
    const embed = {
      title: "Sobre o desenvolvedor deste bot",
      description:
        "Como freelancer e desenvolvedor full-stack, sou apaixonado por aplicar meu conhecimento para resolver problemas do mundo real, construindo produtos únicos. Atualmente, estou morando no Brasil e acredito firmemente que meus projetos podem ser úteis para aqueles que estão iniciando no mundo de desenvolvimento, por isso, mantenho softwares de código aberto disponível para a comunidade.",
      color: 0xd1833e,
      author: {
        name: "João Lima",
        url: "https://joaolima.vercel.app/",
        icon_url:
          "https://cdn.discordapp.com/avatars/528228889823281152/7917e87febfaf33a2b5dd385e32a05cb.png?size=1024",
      },
      footer: {
        text: "© 2023 João Lima. Todos os direitos reservados.",
      },
    };
    await interaction.reply({
      embeds: [embed],
      components: [row1],
      ephemeral: true,
    });
  },
};
