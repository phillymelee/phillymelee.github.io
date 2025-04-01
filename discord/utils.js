const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const { getStorage } = require("firebase-admin/storage");

const logoUrl = process.env.LOGO_URL;

// Gets player ranks from cache.json
async function getPlayerRanks() {
  const storage = getStorage(); // Get the storage instance
  const bucket = storage.bucket(); // Get the default storage bucket
  const file = bucket.file("cache.json"); // Reference the cache.json file
  // Download the file as a buffer
  const [fileContent] = await file.download();
  // Parse JSON from the file content
  const cache = JSON.parse(fileContent.toString("utf8")); // Ensure it's a string
  return cache;
}

async function generateLeaderboardMsg(message) {
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
    const eloDelta = Math.round(player.eloDelta);
    const rankChange =
      eloDelta === 0
        ? ""
        : player.rankChange === "up"
        ? ` (+${Math.round(player.eloDelta)})`
        : player.rankChange === "down"
        ? ` (${Math.round(player.eloDelta)})`
        : player.rankChange === "new"
        ? " ✦︎"
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

    // Porkers line
    if (player.code === "PORK#582" && i !== playersSlice.length - 1) {
      msg += "-----------------------------------------\n";
    }
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

  const embedMsg = new MessageEmbed()
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

  return { embeds: [embedMsg] };
}

async function addPlayer(message) {
  const args = message.content.split(" ");
  if (args.length === 1) {
    return "Please provide a player code.";
  }
  const code = args[1].toLocaleUpperCase();

  const requestOptions = {
    method: "POST",
    headers: { code },
  };
  const response = await fetch(
    "https://addplayer-tsno6gjbiq-uc.a.run.app",
    requestOptions
  );
  const responseJson = await response.json();
  return responseJson.message;
}

async function generateHelpMsg() {
  const embedMsg = new MessageEmbed()
    .setColor("#f6a524") // match philly melee logo
    .setTitle("🏆 Philly Melee Leaderboard")
    .setURL("https://phillymelee.github.io/")
    .setThumbnail(logoUrl)
    .addFields({
      name: "Commands",
      value:
        "!leaderboard [page] - Display the leaderboard\n!addPlayer [code] - Add a player to the leaderboard",
      inline: false,
    });

  return { embeds: [embedMsg] };
}

module.exports = {
  generateLeaderboardMsg,
  addPlayer,
  generateHelpMsg,
};
