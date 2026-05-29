# Improvements

## Bugs

### 1. `return` instead of `continue` in `persistChanges` — `packages/core/src/features/stalker/lol/lol.ts:27`

```ts
for (const { player, lastMatch, newRank } of changes) {
    await storeNewLoLRank(player.puuid, newRank);
    if (!lastMatch) return;  // exits the entire function
    // all subsequent players in the loop are skipped
}
```
Change `return` to `continue`.

---

### 2. Drizzle immutability — `packages/core/src/features/generate24hRecap.ts:273`

```ts
const query = db.select(...).from(bet)...;
if (startDate && endDate) query.where(...);  // .where() returns a new query, doesn't mutate
return query;                                // always returns the unfiltered query
```
The daily bets recap aggregates all-time bets instead of today's. Fix: `return query.where(...)` or reassign.

---

### 3. `appendPlayersToFetch` always re-adds all players — `packages/core/src/features/stalker/stalker.ts:41`

```ts
const newPlayers = (await this.options.getPlayers()).filter((p) => !this.playersPool.includes(p));
```
`getPlayers()` returns fresh DB objects every call. `Array.includes` uses reference equality, so no existing pool entry ever matches — every player is always considered "new". This means the pool grows on every `commitChanges` cycle, duplicating players still mid-processing.

Fix: compare by a stable key, e.g. filter by `puuid`.

---

### 4. Game fetching is filtered at the source instead of at the handler — `packages/core/src/features/stalker/lol/match.ts:40`

`getLastGameId` only fetches queue IDs `[420, 1700]`, which means games from other modes (ARAM, normals, etc.) are never stored at all. This causes two problems:
- Riot rate limit quota is spent on fetch calls that then silently discard most games
- Adding support for a new mode (e.g. queue 1710) requires touching the fetch layer, not just the handler

A better model: fetch the last N games regardless of queue, store all of them in a unified `match` table with the `queueId` column, then dispatch to the appropriate handler based on `queueId`:

```ts
const RANKED_SOLO = 420;
const ARENA = [1700, 1710];

// after storing: route by queue
if (ARENA.includes(game.info.queueId)) await handleArenaGame(game);
else if (game.info.queueId === RANKED_SOLO) await handleRankedGame(game);
// else: stored but no action needed
```

This also eliminates the current dual-table deduplication complexity (`match` + `arenaMatch` checked separately).

---

## Logic improvements

### 6. Streak/count `+1` compensates for call order — `packages/core/src/features/generate24hRecap.ts:79-84`

```ts
const streaksAndCounts = await getWinnerAndLoserStreakAndCount(...)  // queries DB
await storePlayersOfTheDay(...)                                       // then stores
```
The `+1` in `getStreak` and `getNbPlayerOfTheDay` compensates for the fact that today's entry isn't stored yet when querying. It works but makes the call order a load-bearing invariant. Cleaner to store first and remove the `+1`.

---

### 7. Odds calculation hits the live Riot API on every bet — `packages/core/src/features/bets.ts:44`

`calculateOddsFromStats` calls `getLoLNewRank` which makes a network request to fetch wins/losses. That data is already in the `rank` table — `getLoLLastRank` could be used instead.

---

### 8. Discord notification happens before `persistChanges` — `packages/core/src/features/stalker/stalker.ts:92`

If Discord send succeeds but `persistChanges` fails, the rank change is broadcast but never saved. On the next cycle the same change re-triggers and gets double-posted. Persist should come first.
