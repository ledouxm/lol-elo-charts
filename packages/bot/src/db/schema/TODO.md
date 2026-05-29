# Schema TODO

- [x] **`summoner.currentName` aliased from `"name"`** — rename the Postgres column to `current_name` so code and DB agree
- [x] **`rank.summonerId` stores a PUUID** — rename to `puuid` or `summonerPuuid` to match what it actually holds
- [x] **`summoner` has no surrogate `id`** — evaluate if `(puuid, channelId)` composite PK causes pain in practice
- [x] **`request` table is empty** — figure out what it was supposed to track or delete it
- [ ] **`match.kda` is a varchar** — store as three separate integer columns (`kills`, `deaths`, `assists`) or at least a numeric[]
- [ ] **`match.details` duplicates already-extracted columns** — decide: keep the blob and drop the scalar columns, or drop the blob; don't keep both
- [ ] **`apex` has no player references** — document what those integers mean or add FKs if they point to something
- [x] **`summonerArenaPlayerRelations` and `summonerRelations` both define relations for `summoner`** — merge into one
- [ ] **`summonerPuuidCache` is a cache table inside the DB** — consider dropping it in favor of an actual cache layer (Redis, in-memory)
- [ ] **`divisionEnum` includes `"NA"` as a sentinel** — model apex tiers separately so division is not needed / genuinely nullable
- [ ] **`playerOfTheDayTypeEnum: ["winner", "loser"]`** — replace with `isWinner: boolean`
- [ ] **`DrizzleDatabase = {}`** — fill in the actual type or remove the export
