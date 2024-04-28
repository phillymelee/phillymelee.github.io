// index.ts

import { config } from "dotenv";
import { initializeApp } from "@firebase/app";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getDownloadURL, getStorage, ref, uploadBytes } from "@firebase/storage";
import { IRankInfo, getRanks } from "./utils";

config();
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

/**
 * Adds a valid player connect code to players.json
 */
export const addPlayer = onRequest({ cors: true }, async (request, response) => {
  logger.info("Add Players:", { structuredData: true });

  let code = request.headers.code;
  if (code === undefined || typeof code !== "string") {
    logger.info("Bad request: Missing player code", { structuredData: true });
    response.status(400).send({ message: "Missing player code." });
    return;
  }
  code = code.toUpperCase();
  const requestOptions = {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "operationName": "AccountManagementPageQuery",
      "variables": { "cc": code, "uid": code },
      "query": "fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n"
    }),
  };

  const data = await (await fetch("https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql", requestOptions)).json();
  if (data.data.getConnectCode === null) {
    logger.info(`Bad request: Player code ${code} not found`, { structuredData: true });
    response.status(400).send({ message: `Player code ${code} not found.` });
    return;
  }

  const storage = getStorage();
  const fileRef = ref(storage, "players.json");
  const url = await getDownloadURL(fileRef);
  const players = await (await fetch(url)).json();

  if (players.indexOf(code) !== -1) {
    logger.info(`Bad request: Player code ${code} already is registered.`, { structuredData: true });
    response.status(400).send({ message: `Player code ${code} already is registered.` });
    return;
  }
  else {
    players.push(code);
    const updatedContent = JSON.stringify(players);
    const blob = new Blob([updatedContent], { type: 'application/json' });
    await uploadBytes(fileRef, blob);

    logger.info(`Player code ${code} added.`, { structuredData: true });
    response.status(200).send({ message: `Player code ${code} successfully registered!` });
  }
});

// Gets player ranks from cache.json
export const getPlayerRanks = onRequest({ cors: true }, async (request, response) => {
  logger.info("Get Player Ranks:", { structuredData: true });
  const storage = getStorage();
  const fileRef = ref(storage, "cache.json");
  const url = await getDownloadURL(fileRef);
  const cache = await (await fetch(url)).json();
  logger.info("Players:", cache, { structuredData: true });
  response.send(cache.playerRanks);
});

// Updates cache every 5 minutes
/**
 * Runs every 15th minute
 * Fetches player list from players.json, gets their rank/info from Slippi, and updates cache.json
 */
exports.cacheManage = onSchedule("*/15 * * * *", async (event) => {
  // We will update each player's `yesterdayElo` value at 4am every day
  const time = new Date(event.scheduleTime);
  const newDay = time.getHours() === 4 && time.getMinutes() === 0;
  const logMessage = newDay ? "Updating Cache - New Day" : "Updating cache";
  
  logger.info(logMessage, { structuredData: true });

  const storage = getStorage();

  // Get old cache
  const fileRef = ref(storage, "cache.json");
  const url = await getDownloadURL(fileRef);
  const yesterdayElos: { [key: string]: number | undefined } = {};
  const cachePlayerRanks: IRankInfo[] = (await (await fetch(url)).json()).playerRanks;
  cachePlayerRanks.forEach((rank: IRankInfo) => yesterdayElos[rank.code] = rank.yesterdayElo);

  // Get player list
  const playersFileRef = ref(storage, "players.json");
  const playersUrl = await getDownloadURL(playersFileRef);
  const players = await (await fetch(playersUrl)).json();

  // Get new ranks
  const playerRanks = await getRanks(players);

  // Calculate rank change - Loop over each player and compare their old and new ranks
  for (let i = 0; i < playerRanks.length; i++) {
    const code = playerRanks[i].code;
    let change = "none";
    // If it's a new day, then we should set yesterdayElo to the current elo
    // Everyone will have change "none" for this cycle
    if (newDay) {
      playerRanks[i].yesterdayElo = playerRanks[i].elo;
    } else {
      // Otherwise, we should compare the current elo to the elo from yesterday (if it exists)
      const yesterdayElo = code in yesterdayElos ? yesterdayElos[code] : undefined;
      // Make sure we carryover yesterdayElo to the new cache
      playerRanks[i].yesterdayElo = yesterdayElo;
      if (yesterdayElo !== undefined) {
        if (playerRanks[i].elo > yesterdayElo) {
          change = "up";
        } else if (playerRanks[i].elo < yesterdayElo) {
          change = "down";
        }
      }
    }
    playerRanks[i].rankChange = change;
  }

  // Update cache.json
  const newCacheObject = {
    lastUpdated: Date.now(),
    playerRanks,
  };
  const cacheFileRef = ref(storage, "cache.json");
  const updatedContent = JSON.stringify(newCacheObject);
  const blob = new Blob([updatedContent], { type: 'application/json' });
  logger.info("Cache updated:", newCacheObject, { structuredData: true });
  await uploadBytes(cacheFileRef, blob);
});
