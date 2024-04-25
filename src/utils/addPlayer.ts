// addPlayer.ts

export interface IResponse {
    status: number;
    message: string;
}

export async function addPlayer(code: string): Promise<IResponse> {
    const requestOptions = {
        method: "POST",
        headers: { code }
    };
    const response = await (fetch("https://addplayers-tsno6gjbiq-uc.a.run.app", requestOptions));
    const message = (await response.json()).message;
    return { status: response.status, message };
}
