// addPlayer.ts

import { IAddPlayerResponse } from "./interfaces";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
    process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

export async function addPlayer(code: string): Promise<IAddPlayerResponse> {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        return {
            status: 500,
            message: "Registration is not configured. Please try again later."
        };
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/registration`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
                },
                body: JSON.stringify({ code })
            }
        );

        const responseJson = await response.json();

        return {
            status: response.status,
            message: responseJson.message ?? "Registration request failed."
        };
    } catch {
        return {
            status: 503,
            message: "Could not contact the registration service. Please try again."
        };
    }
}
