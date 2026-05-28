# Effect Migration Plan

Migrating `packages/core` to Effect incrementally, step by step. Each phase is self-contained — the app stays runnable between phases.

---

## Phase 1 — Foundation: runtime + config

**Goal:** Establish the Effect runtime and replace env validation with `Config`.

- Replace `envVars.ts` (Zod schema) with Effect `Config` / `ConfigProvider`
- Define a root `Layer` composition file (e.g. `src/layers.ts`)
- Replace the top-level `main.tsx` startup with a single `Effect.runPromise(program.pipe(Effect.provide(AppLayer)))`
- Keep all existing code untouched — just wrap the entry point

**Why first:** Every other phase depends on having a runtime and config in place.

---

## Phase 2 — Database layer

**Goal:** Wrap Drizzle behind a typed `Database` service.

- Define a `Database` service tag (`Context.Tag<Database>`)
- Wrap each Drizzle query in `Effect.tryPromise` with a typed `DbError`
- Expose methods like `getActiveSummoners`, `insertRank`, `upsertSummoner`, etc.
- Provide the service via `Layer.effect(Database, ...)` that opens the connection and runs migrations

**Why second:** Everything else (stalker, cron, API) depends on the DB. Getting this right unlocks all other phases.

---

## Phase 3 — Stalker — polling loop

**Goal:** Replace `setInterval` + mutable state with Effect primitives.

Current shape:
- Two `setInterval` loops (fetch one player, send batched notifications)
- Mutable `currentChanges: Change[]` buffer

Effect shape:
- `Queue.unbounded<Change>()` replaces the mutable buffer
- `Effect.repeat(fetchOnePlayer, Schedule.fixed(Duration.seconds(N)))` replaces the fetch interval
- `Effect.repeat(flushNotifications, Schedule.fixed(Duration.seconds(M)))` replaces the notification interval
- Both loops run as concurrent fibers via `Effect.forkScoped` or `Effect.all({ concurrency: "unbounded" })`
- The generic `Stalker<Player, Match, RemoteRank, DbRank>` base class becomes a parameterized `Layer` factory
- `lolStalker` and `valorantStalker` become `Layer` implementations of a `StalkerService` interface

**Key patterns to learn here:** `Queue`, `Ref`, `Schedule`, `Fiber`, `Scope`.

---

## Phase 4 — Error handling

**Goal:** Type all error channels explicitly.

- Define `Data.TaggedError` classes for each failure domain:
  - `RiotApiError`, `ValorantApiError`, `DbError`, `DiscordError`
- Replace bare `try/catch` and `unknown` error types with typed `Effect.tryPromise({ try, catch })`
- Add `Effect.catchTag` / `Effect.catchAll` at the stalker boundary to decide: retry, skip, or notify

**Why here:** Once the stalker is in Effect, typed errors make retry/fallback logic clean to express.

---

## Phase 5 — Cron jobs

**Goal:** Replace `node-cron` with Effect-managed scheduled fibers.

- Replace each `cron.schedule(expr, fn)` call in `startCronJobs.ts` with `Effect.repeat(job, Schedule.cron(expr))`
- Each job is an `Effect` — DB access uses the `Database` service from Phase 2
- All jobs are started as fibers inside the root scope

---

## Phase 6 — HTTP / API layer

**Goal:** Replace Express with `@effect/platform` `HttpRouter`.

- Rewrite `features/api/router.ts`, `duoq.ts`, `live.ts` as `HttpRouter` handlers
- Request/response types become typed schemas (`Schema` from `@effect/schema`)
- Middleware (CORS, request tracking) becomes `HttpMiddleware`
- Mount via `HttpServer.serve` instead of `app.listen`

**Note:** The endpoints are small — this is mostly mechanical. Start with `/api/duoq` as a pilot.

---

## Phase 7 — Discord bot

**Goal:** Wrap discord.js event handlers in Effect at the boundaries.

- Keep `discordx` decorator-based commands as-is (decorators + Effect don't mix cleanly)
- Wrap command handler bodies in `Effect.runPromise(effect.pipe(Effect.provide(AppLayer)))`
- Define a `DiscordService` tag that exposes `sendMessage`, `sendEmbed`, etc. as Effects
- The stalker's `sendDiscordMessages` call becomes `Effect.flatMap(DiscordService, s => s.sendEmbed(...))`

**Why last:** discordx is the most opaque boundary. Keeping decorators intact and wrapping only the interiors is the least risky approach.

---

## Recommended order

```
Phase 1 (Config + runtime)
  → Phase 2 (DB layer)
    → Phase 3 (Stalker)        ← most interesting, learn the most here
      → Phase 4 (Error types)
        → Phase 5 (Cron)
          → Phase 6 (HTTP)
            → Phase 7 (Discord)
```

Each phase leaves the app runnable. Phases 3 and 4 together are the core of the migration.
