// interfaces.ts

export interface IRankInfo {
    tag: string;
    code: string;
    rank: string;
    elo: number;
    wins: number;
    losses: number;
    character: string;
    rankChange: "up" | "down" | "new" | "none";
    eloDelta: number;
}

export interface IAddPlayerResponse {
    status: number;
    message: string;
}
