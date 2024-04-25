// fetchRanks.ts

import { IRankInfo } from "./interfaces";

export async function getRanks(): Promise<IRankInfo[]> {
    const response = await (fetch("https://getplayerranks-tsno6gjbiq-uc.a.run.app"));
    return response.json();
};
