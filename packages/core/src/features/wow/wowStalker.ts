import { db } from "@/db/db";
import { InsertWoWMythicRun, SelectWoWCharacter, wowCharacter, wowMythicRun } from "@/db/wowSchema";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { WoWMythicPlusResponse } from "./wowTypes";

export const getWowRecentRun = async ({
    region,
    realm,
    name,
    channelId,
}: {
    region: string;
    realm: string;
    name: string;
    channelId: string;
}) => {
    const { data } = await axios.get("https://raider.io/api/v1/characters/profile", {
        params: {
            region,
            realm,
            name,
            fields: "mythic_plus_recent_runs",
        },
    });

    await saveRecentRuns(data, channelId);

    return data;
};

const saveRecentRuns = async (run: WoWMythicPlusResponse, channelId: string) => {
    const character = await createOrUpdateCharacter(run, channelId);

    for (const mythicRun of run.mythic_plus_recent_runs) {
        const existingRun = await db.select().from(wowMythicRun).where(eq(wowMythicRun.url, mythicRun.url));
        if (existingRun[0]) {
            continue;
        }

        const payload: InsertWoWMythicRun = {
            url: mythicRun.url,
            characterId: character.id,
            dungeon: mythicRun.dungeon,
            shortName: mythicRun.short_name,
            mythicLevel: mythicRun.mythic_level,
            completedAt: new Date(mythicRun.completed_at),
            clearTimeMs: mythicRun.clear_time_ms,
            parTimeMs: mythicRun.par_time_ms,
            numKeystoneUpgrades: mythicRun.num_keystone_upgrades,
            mapChallengeModeId: mythicRun.map_challenge_mode_id,
            iconUrl: mythicRun.icon_url,
            backgroundImageUrl: mythicRun.background_image_url,
            score: mythicRun.score as any,
        };

        await db.insert(wowMythicRun).values(payload).execute();
    }
};

const createOrUpdateCharacter = async (run: WoWMythicPlusResponse, channelId: string): Promise<SelectWoWCharacter> => {
    const character = (
        await db
            .select()
            .from(wowCharacter)
            .where(
                and(
                    eq(wowCharacter.name, run.name),
                    eq(wowCharacter.realm, run.realm),
                    eq(wowCharacter.region, run.region),
                    eq(wowCharacter.channelId, channelId)
                )
            )
    )?.[0];

    if (!character) {
        return (
            await db
                .insert(wowCharacter)
                .values({
                    name: run.name,
                    realm: run.realm,
                    region: run.region,
                    lastCrawledAt: run.last_crawled_at,
                    class: run.class,
                    spec: run.active_spec_name,
                    thumbnailUrl: run.thumbnail_url,
                    channelId,
                })
                .returning()
        )[0];
    }
    return (
        await db
            .update(wowCharacter)
            .set({
                lastCrawledAt: run.last_crawled_at,
                class: run.class,
                spec: run.active_spec_name,
                thumbnailUrl: run.thumbnail_url,
            })
            .where(eq(wowCharacter.id, character.id))
            .returning()
    )[0];
};
