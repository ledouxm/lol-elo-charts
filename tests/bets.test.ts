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
