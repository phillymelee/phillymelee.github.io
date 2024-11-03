const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const {
  generateLeaderboardMsg,
  addPlayer,
  generateHelpMsg,
} = require("./utils");
dotenv.config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

const commandMap = {
  "!lb": generateLeaderboardMsg,
  "!leaderboard": generateLeaderboardMsg,
  "!addplayer": addPlayer,
  "!help": generateHelpMsg,
};

admin.initializeApp({
  credential: admin.credential.cert(
    require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ),
  storageBucket: process.env.STORAGE_BUCKET,
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  const lowerMessage = message.content.toLocaleLowerCase();
  const command = Object.keys(commandMap).find((cmd) =>
    lowerMessage.startsWith(cmd)
  );
  if (command) {
    try {
      const msg = await commandMap[command](message);
      message.channel.send(msg);
    } catch (error) {
      console.error(error);
      message.channel.send("An error occurred, please try again later.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
