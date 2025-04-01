// fetchRanks.ts

import { RateLimiter } from "limiter";
import * as logger from "firebase-functions/logger";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "@firebase/storage";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 'second' });

export interface IRankInfo {
    tag: string;
    code: string;
    rank: string;
    elo: number;
    wins: number;
    losses: number;
    character: string;
    // TODO: Why are these optional i don't remember lol
    yesterdayElo?: number;
    rankChange?: string;
    eloDelta?: number;
}

export async function getRanks(players: string[]): Promise<IRankInfo[]> {
    return (
        (await Promise.all(players.map(getRankInfo))).filter((rankInfo => rankInfo !== undefined)) as IRankInfo[])
        .filter((rankInfo => rankInfo.wins + rankInfo.losses >= 5)).sort((a, b) => b.elo - a.elo);
};

async function getRankInfo(code: string): Promise<IRankInfo | undefined> {
    const requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "operationName": "AccountManagementPageQuery",
            "variables": { "cc": code, "uid": code },
            "query": "fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n"
        }),
    };
    await limiter.removeTokens(1);
    const url = "https://gql-gateway-2-dot-slippi.uc.r.appspot.com/graphql";
    const data = await (await fetch(url, requestOptions)).json();

    if (data.data.getConnectCode === null) {
        // If the player no longer exists return undefined.
        // For now, we will not remove the player from the list. It's possible Slippi services are down and
        // all players are temporarily unavailable. We don't want to remove all players in that case.
        // TODO: Find a way to remove players that no longer exist if this becomes an issue.
        logger.info(`Player ${code} not found while updating.`, { structuredData: true });
        return undefined;
    }

    const elo = data.data.getConnectCode.user.rankedNetplayProfile.ratingOrdinal;
    // It seems that the dailyGlobalPlacement is only available for the top 300 players.
    const isTop300 = data.data.getConnectCode.user.rankedNetplayProfile.dailyGlobalPlacement !== null;

    // Get most played character
    let character: string;
    if (code === "FUDG#228") {
        character = "FUDGE";
    }
    else if (code === "IGHT#1") {
        character = "IGHT";
    }
    else {
        const characters = data.data.getConnectCode.user.rankedNetplayProfile.characters;
        if (characters.length === 0) {
            character = "";
        } else {
            character = characters.reduce((mostCommon: any, current: any) => {
                return current.gameCount > mostCommon.gameCount ? current : mostCommon;
            }).character;
        }
    }

    return {
        tag: data.data.getConnectCode.user.displayName,
        code,
        rank: convertElo(elo, isTop300),
        elo,
        wins: data.data.getConnectCode.user.rankedNetplayProfile.wins ?? 0,
        losses: data.data.getConnectCode.user.rankedNetplayProfile.losses ?? 0,
        character,
    };
};

function convertElo(elo: number, isTop300: boolean): string {
    if (elo < 765.43) return "Bronze 1";
    if (elo < 913.72) return "Bronze 2";
    if (elo < 1054.87) return "Bronze 3";
    if (elo < 1188.88) return "Silver 1";
    if (elo < 1315.75) return "Silver 2";
    if (elo < 1435.48) return "Silver 3";
    if (elo < 1548.07) return "Gold 1";
    if (elo < 1653.52) return "Gold 2";
    if (elo < 1751.83) return "Gold 3";
    if (elo < 1843) return "Platinum 1";
    if (elo < 1927.03) return "Platinum 2";
    if (elo < 2003.92) return "Platinum 3";
    if (elo < 2073.67) return "Diamond 1";
    if (elo < 2136.28) return "Diamond 2";
    if (elo < 2191.75) return "Diamond 3";
    // Special case: If the player is top 300 and their elo is at least master level (2191.75), then they are Grandmaster.
    if (isTop300) return "Grandmaster";
    if (elo < 2275) return "Master 1";
    if (elo < 2350) return "Master 2";
    return "Master 3";
};

/**
 * Not used for now.
 */
// async function removePlayer(code: string): Promise<void> {
//     const storage = getStorage();
//     const fileRef = ref(storage, "players.json");
//     const url = await getDownloadURL(fileRef);
//     const players = await (await fetch(url)).json();
//     const newPlayers = players.filter((player: string) => player !== code);

//     const updatedContent = JSON.stringify(newPlayers);
//     const blob = new Blob([updatedContent], { type: 'application/json' });
//     await uploadBytes(fileRef, blob);

//     logger.info(`Player ${code} removed.`, { structuredData: true });
// }