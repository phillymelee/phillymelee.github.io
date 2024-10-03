const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { getStorage, ref, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("@firebase/app");
const dotenv = require("dotenv");

const logoUrl = process.env.LOGO_URL;

dotenv.config();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};
initializeApp(firebaseConfig);

// Gets player ranks from cache.json
const getPlayerRanks = async () => {
  const storage = getStorage();
  const fileRef = ref(storage, "cache.json");
  const url = await getDownloadURL(fileRef);
  const cache = await (await fetch(url)).json();
  return cache;
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (
    message.content.startsWith("!lb") ||
    message.content.startsWith("!leaderboard")
  ) {
    const args = message.content.split(" ");
    args.shift().toLowerCase(); // !lb
    const param = args.join(" "); // Everything after !lb
    const num = Number(param);
    let page = 1;
    if (!isNaN(num) && num > 0) {
      page = num;
    }

    const ranks = await getPlayerRanks();
    const players = ranks.playerRanks;

    if ((page - 1) * 15 > players.length) {
      page = 1;
    }

    const playersSlice = players.slice((page - 1) * 15, page * 15);

    let msg = "";
    for (let i = 0; i < playersSlice.length; i++) {
      const player = playersSlice[i];
      const rankChange =
        player.rankChange === "up"
          ? " ↑"
          : player.rankChange === "down"
          ? " ↓"
          : "";

      let place = `${(page - 1) * 15 + (i + 1)}.`;
      if (place === "1.") {
        place = "🥇";
      } else if (place === "2.") {
        place = "🥈";
      } else if (place === "3.") {
        place = "🥉";
      }

      msg += `${place} **${player.tag}** (${player.code}) - ${Math.round(
        player.elo
      )}${rankChange}\n`;
    }

    const now = new Date();
    const options = {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const lastUpdate = now.setMinutes(
      Math.floor(now.getMinutes() / 15) * 15,
      0,
      0
    );

    const embedMsg = new EmbedBuilder()
      .setColor("#f6a524") // match philly melee logo
      .setTitle("🏆 Philly Melee Leaderboard")
      .setURL("https://phillymelee.github.io/")
      .setDescription("Ratings are updated every 15 minutes")
      .setThumbnail(logoUrl)
      .addFields({
        name: `Last updated: ${new Date(lastUpdate).toLocaleString(
          "en-US",
          options
        )}`,
        value: msg,
        inline: false,
      })
      .setTimestamp()
      .setFooter({
        text: `Page ${page} of ${Math.ceil(players.length / 15)}`,
      });

    message.channel.send({ embeds: [embedMsg] });
  }
});

client.login(process.env.DISCORD_TOKEN);
