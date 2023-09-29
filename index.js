// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const youtubeCookie =
  "VISITOR_INFO1_LIVE=DCinohd1YNg; LOGIN_INFO=AFmmF2swRQIhALpTTR7oPHGBHebVlLfWXJ0mcZG-uegKjjf_XAyskETQAiBCPyTkjWeYM0CYo1JBn_BNIG7m71-qJzXqmOSXcbCsTQ:QUQ3MjNmd05Od3VnOVkwN0FHbzFqWmFTNk94dW1LNm5OT25xUjFzUmRHcVY2Sld3WGc5UDdVUFdHUWxWZG9MTm5FSmluNVVCemhoTFRDNjVpTU9BRE56bEZOMEN3R0ZaRFBfV3h0Wlp3V0dSMjdkWElvLUlqWGJlM3YydXdsSmRIT29HNV9xanhTMTAwdFEyYWV3VnFTQkZwc0dPd3hHakNR; __utmz=27069237.1690948065.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); HSID=Ar6TiBiJO70Tl_Kvo; SSID=AUaWraONl68Z1eAoJ; APISID=cKT6w9cLy6kQNSnZ/A24kRTTVU1bSTma6Q; SAPISID=aVFEFYrxW3tGfly_/AdPxPmCpQqaG3ZSEH; __Secure-1PAPISID=aVFEFYrxW3tGfly_/AdPxPmCpQqaG3ZSEH; __Secure-3PAPISID=aVFEFYrxW3tGfly_/AdPxPmCpQqaG3ZSEH; SID=ZwjbYa2vSueO3r7KI_hmV6K7DmwpL-vacuLGY5DhoF9Av56Yc6_wGgKdeh35wUq1Z4mdNA.; __Secure-1PSID=ZwjbYa2vSueO3r7KI_hmV6K7DmwpL-vacuLGY5DhoF9Av56Y8tj7a3BaIOBI60U5cArdJg.; __Secure-3PSID=ZwjbYa2vSueO3r7KI_hmV6K7DmwpL-vacuLGY5DhoF9Av56YELhp-3_A1VgXSmRb-GSgCQ.; PREF=f6=40000000&tz=America.Sao_Paulo&f7=100; YSC=DERuRuDGL0s; __utma=27069237.1145391580.1690948065.1691350652.1692387367.3; __utmc=27069237; __Secure-1PSIDTS=sidts-CjEBSAxbGU9GzRHoF5anVJSmsczKMSS0d8lUsJCYII8yrAnX0oF55F5obns4J-GnPTntEAA; __Secure-3PSIDTS=sidts-CjEBSAxbGU9GzRHoF5anVJSmsczKMSS0d8lUsJCYII8yrAnX0oF55F5obns4J-GnPTntEAA; SIDCC=APoG2W8l2BTW8PEnRNwVewuF4jN_JyPK4yyOcMEwT6915E6MC5kjaigdLRo0DjdzJS7-J5dE0pQ4; __Secure-1PSIDCC=APoG2W9TFxLZtu7bu4VCNYHb4XUZYYe1CbW1TDQYJ9RYy0yPHAJObwgIdrXbldSnBv_gTVsWOWEv; __Secure-3PSIDCC=APoG2W9GGiKRIpRHSXuuKhoOkiyQ0PpSUBM2XInVeAiZEtk4jNYnzYIMmm681z90zq4l49I79rOv";

const distube = new DisTube(client, {
  youtubeCookie: youtubeCookie,
  emitNewSongOnly: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: true,
  plugins: [
    new SoundCloudPlugin(),
    new SpotifyPlugin({
      emitEventsAfterFetching: true,
    }),
  ],
});
module.exports = distube;

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
