// fetchRanks.ts

import { IRankInfo } from "./interfaces";

const CACHE_URL = "https://phillymelee.github.io/philly-cache.json";

export interface ILeaderboardCache {
    ranks: IRankInfo[];
    lastUpdated: number | null;
}

export async function getRanks(): Promise<ILeaderboardCache> {
    const response = await fetch(`${CACHE_URL}?t=${Date.now()}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: HTTP ${response.status}`);
    }

    const cache: {
        playerRanks: IRankInfo[];
        lastUpdated?: number | null;
    } = await response.json();

    return {
        ranks: cache.playerRanks,
        lastUpdated: cache.lastUpdated ?? null,
    };
}
