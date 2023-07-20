import "../src/envVars";
import { db, initDb } from "../src/db/db";
import { summoner } from "../src/db/schema";
import { describe, it, expect, beforeAll } from "vitest";

describe("Bets", () => {
    beforeAll(async () => {
        await initDb();
    });

    it("should place a bet", async () => {
        const res = await db.select().from(summoner);
        expect(res).toEqual([]);
    });
});

// create 3 summoners on 3 different channels
// insert ranks for each summoner, one must have a rank yesterday and one today
// generate and check 24h ranks recap message
// insert 3 bets for each summoner
// insert new ranks resolving the bets
// check bets and points for each summoner
// generate and check 24h bets recap message
