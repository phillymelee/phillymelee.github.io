// fetchRanks.ts

export interface IRankInfo {
    tag: string;
    code: string;
    rank: string;
    elo: number;
    wins: number;
    losses: number;
    character: string;
}

export async function getRanks(): Promise<IRankInfo[]> {
    const players = await getPlayers();
    return (await Promise.all(players.map(getRankInfo)))
        .filter((rankInfo => rankInfo.wins + rankInfo.losses >= 5)).sort((a, b) => b.elo - a.elo);
};

function convertElo(elo: number): string {
    if (elo < 765.42) return "Bronze 1";
    if (elo < 913.71) return "Bronze 2";
    if (elo < 1054.86) return "Bronze 3";
    if (elo < 1188.87) return "Silver 1";
    if (elo < 1315.74) return "Silver 2";
    if (elo < 1435.47) return "Silver 3";
    if (elo < 1548.06) return "Gold 1";
    if (elo < 1653.51) return "Gold 2";
    if (elo < 1751.82) return "Gold 3";
    if (elo < 1842.99) return "Platinum 1";
    if (elo < 1927.02) return "Platinum 2";
    if (elo < 2003.91) return "Platinum 3";
    if (elo < 2073.66) return "Diamond 1";
    if (elo < 2136.27) return "Diamond 2";
    if (elo < 2191.74) return "Diamond 3";
    if (elo < 2274.99) return "Master 1";
    if (elo < 2350) return "Master 2";
    return "Grandmaster";
};

async function getPlayers(): Promise<string[]> {
    const response = await (fetch("https://getplayers-tsno6gjbiq-uc.a.run.app"));
    return response.json();
};

function getRankInfo(code: string): Promise<IRankInfo> {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "operationName": "AccountManagementPageQuery",
                "variables": { "cc": code, "uid": code },
                "query": "fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n"
            }),
        };
        fetch("https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql", requestOptions)
            .then(response => response.json())
            .then((data) => {
                const elo = Math.round(data.data.getConnectCode.user.rankedNetplayProfile.ratingOrdinal);
                const character = code === "FUDG#228" ? "FUDGE" : data.data.getConnectCode.user.rankedNetplayProfile.characters.length !== 0 ?
                    data.data.getConnectCode.user.rankedNetplayProfile.characters[0].character : "";
                const rankInfo: IRankInfo = {
                    tag: data.data.getConnectCode.user.displayName,
                    code: code,
                    rank: convertElo(elo),
                    elo,
                    wins: data.data.getConnectCode.user.rankedNetplayProfile.wins ?? 0,
                    losses: data.data.getConnectCode.user.rankedNetplayProfile.losses ?? 0,
                    character,
                };
                resolve(rankInfo);
            })
            .catch(error => reject(error));
    });

};

