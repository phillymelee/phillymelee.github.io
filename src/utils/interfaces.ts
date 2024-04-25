// interfaces.ts

export interface IRankInfo {
    tag: string;
    code: string;
    rank: string;
    elo: number;
    wins: number;
    losses: number;
    character: string;
}

export interface IAddPlayerResponse {
    status: number;
    message: string;
}
