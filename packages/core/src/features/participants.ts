import { db } from "@/db/db";
import { lolParticipant, match } from "@/db/schema";
import { makeDebug } from "@/utils";
import { eq, isNotNull, sql } from "drizzle-orm";
import Galeforce from "galeforce";

const debug = makeDebug("participants");

export const generateParticipants = async () => {
    const participantsSize = await getParticipantsSize();
    if (participantsSize > 0) {
        debug("Participants already generated, skipping");
        return;
    }

    const matchSize = await getMatchSize();
    const pageSize = 100;

    for (let start = 0; start < matchSize; start += pageSize) {
        debug(`Processing matches ${start} to ${start + pageSize} of ${matchSize}`);
        const matches = await getMatchPage(start, pageSize);

        for (const match of matches) {
            if (match.details) {
                await generateParticipantsForMatch(match.details);
            }
        }
    }
};

export const generateParticipantsForMatch = async (match: Galeforce.dto.MatchDTO) => {
    const participantsToInsert = match.info.participants.map((p) => ({
        matchId: match.metadata.matchId,
        puuid: p.puuid,
        win: hasParticipantWon(p.puuid, match),
    }));
    try {
        await db.insert(lolParticipant).values(participantsToInsert).execute();
    } catch (e) {}
};

const hasParticipantWon = (puuid: string, match: Galeforce.dto.MatchDTO) => {
    const participant = match.info.participants.find((p) => p.puuid === puuid)!;
    if (typeof participant.win === "boolean") return participant.win;

    const winningTeamId = match.info.teams.find((t) => t.win)?.teamId;
    if (!winningTeamId) return false;

    return participant.teamId === winningTeamId;
};

const getParticipantsSize = async () => {
    const progress = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(lolParticipant)
        .execute();
    return progress[0].count;
};

const getMatchSize = async () => {
    const count = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(match)
        .where(isNotNull(match.details))
        .execute();

    return count[0].count;
};

const getMatchPage = async (start: number, count: number) => {
    return db
        .select({
            details: match.details,
            matchId: match.matchId,
        })
        .from(match)
        .orderBy(match.createdAt)
        .where(isNotNull(match.details))
        .limit(count)
        .offset(start)
        .execute();
};
