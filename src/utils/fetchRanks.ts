// fetchRanks.ts

import { IRankInfo } from "./interfaces";

const CACHE_URL = "https://phillymelee.github.io/philly-cache.json";

export async function getRanks(): Promise<IRankInfo[]> {
    const response = await fetch(`${CACHE_URL}?t=${Date.now()}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: HTTP ${response.status}`);
    }

    const cache: {
        playerRanks: IRankInfo[];
    } = await response.json();

    return cache.playerRanks;
}
