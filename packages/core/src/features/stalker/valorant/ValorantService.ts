import { db } from "@/db/db";
import { ValorantPlayer, valorantPlayer } from "@/db/valorantSchema";
import { valorantApi } from "@/valorantApi";
import { Schemas } from "@/valorantApi.gen";
import { and, eq } from "drizzle-orm";

export class ValorantService {
    static async getPlayerByName(nameAndTag: string): Promise<Schemas.v1_account["data"]> {
        const [name, tag] = nameAndTag.split("#");
        const res = await valorantApi.get("/valorant/v1/account/{name}/{tag}", {
            path: { name, tag },
            query: { force: false },
        });

        return res.data;
    }

    static async getPlayerCurrentMmr(puuid: string): Promise<ValorantMmr> {
        const res = await valorantApi.get("/valorant/v1/by-puuid/mmr/{affinity}/{puuid}", {
            path: { affinity: "eu", puuid },
        });

        return res.data;
    }

    static async getContent() {
        const res = await valorantApi.get("/valorant/v1/premier/seasons/{affinity}", { path: { affinity: "eu" } });

        return res;
    }

    static async getLastGame(puuid: string): Promise<Schemas.match> {
        const res = await valorantApi.get("/valorant/v3/by-puuid/matches/{affinity}/{puuid}", {
            path: { affinity: "eu", puuid },
            query: { size: 1, mode: "competitive" },
        });

        return res.data?.[0];
    }
}

export const addValorantPlayer = async (player: Schemas.v1_account["data"], channelId: string) => {
    const existings = await db
        .select()
        .from(valorantPlayer)
        .where(and(eq(valorantPlayer.puuid, player.puuid), eq(valorantPlayer.channelId, channelId)));

    const currentName = player.name + "#" + player.tag;

    if (existings?.[0]) {
        await db
            .update(valorantPlayer)
            .set({ isActive: true, currentName })
            .where(eq(valorantPlayer.puuid, player.puuid));
    }

    // if (existings.length) {
    await db.insert(valorantPlayer).values({
        channelId,
        puuid: player.puuid,
        currentName: player.name + "#" + player.tag,
        card: player.card.large,
        picture: player.card.small,
        isActive: true,
    });
};

export const removeValorantPlayer = async (name: string, channelId: string) => {
    const existing = (
        await db
            .select()
            .from(valorantPlayer)
            .where(and(eq(valorantPlayer.currentName, name), eq(valorantPlayer.channelId, channelId)))
            .limit(1)
    )?.[0];

    if (!existing) throw new Error("Valorant player not found");

    await db
        .update(valorantPlayer)
        .set({ isActive: false })
        .where(and(eq(valorantPlayer.currentName, name), eq(valorantPlayer.channelId, channelId)));

    return "ok";
};

export type ValorantPlayerWithChannels = ValorantPlayer & { channels: string[] };

export type ValorantMmr = Schemas.v1mmr["data"];
export type ValorantMatch = Schemas.match;
