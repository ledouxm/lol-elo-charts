# Effect Migration Plan

Migrating `packages/core` to Effect in `packages/bot`, step by step.

## Folder structure

```
src/
├── main.ts                        ✅ entry point — Effect.runPromise(program.pipe(provide(AppLayer)))
├── layers.ts                      ✅ root AppLayer composition
├── config.ts                      ✅ Effect Config (DISCORD_TOKEN, DATABASE_URL, …)
├── errors.ts                      ✅ Data.TaggedError — RiotApiError, ValorantApiError, DbError, DiscordError
├── db/
│   └── index.ts                   ✅ DatabaseService tag stub
└── features/
    ├── stalker/
    │   ├── index.ts               ✅ StalkerService tag stub
    │   ├── lol/index.ts           ✅ LolStalkerLayer stub
    │   └── valorant/index.ts      ✅ ValorantStalkerLayer stub
    ├── discord/index.ts           ✅ DiscordService tag stub
    ├── api/index.ts               ✅ ApiLayer stub
    └── cron/index.ts              ✅ CronLayer stub
```

---

## Phase 1 — Foundation: runtime + config ✅

**Goal:** Establish the Effect runtime and replace env validation with `Config`.

- [x] Entry point `src/main.ts` — `Effect.runPromise(program.pipe(Effect.provide(AppLayer)))`
- [x] `src/layers.ts` — root `AppLayer` composition
- [x] `src/config.ts` — `Effect.Config` for env vars (replaces Zod `envVars.ts`)
- [x] Wire `AppConfig` into `AppLayer` via `Layer.effect` / `ConfigProvider`

**Why first:** Every other phase depends on having a runtime and config in place.

---

## Phase 2 — Database layer

**Goal:** Wrap Drizzle behind a typed `Database` service.

- [x] `DatabaseService` tag defined in `src/db/index.ts`
- [ ] Implement `DatabaseLayer` — open postgres connection, run migrations
- [ ] Wrap each Drizzle query in `Effect.tryPromise` with `DbError`
- [ ] Expose methods: `getActiveSummoners`, `insertRank`, `upsertSummoner`, etc.

**Why second:** Everything else (stalker, cron, API) depends on the DB. Getting this right unlocks all other phases.

---

## Phase 3 — Stalker — polling loop

**Goal:** Replace `setInterval` + mutable state with Effect primitives.

- [x] `StalkerService` tag + `LolStalkerLayer` / `ValorantStalkerLayer` stubs in `src/features/stalker/`
- [ ] `Queue.unbounded<Change>()` replaces `currentChanges: Change[]` mutable buffer
- [ ] `Effect.repeat(fetchOnePlayer, Schedule.fixed(...))` replaces fetch `setInterval`
- [ ] `Effect.repeat(flushNotifications, Schedule.fixed(...))` replaces notification `setInterval`
- [ ] Both fibers via `Effect.forkScoped` or `Effect.all({ concurrency: "unbounded" })`
- [ ] Generic `Stalker` base class becomes a parameterized `Layer` factory

**Key patterns:** `Queue`, `Ref`, `Schedule`, `Fiber`, `Scope`.

---

## Phase 4 — Error handling

**Goal:** Type all error channels explicitly.

- [x] `RiotApiError`, `ValorantApiError`, `DbError`, `DiscordError` defined in `src/errors.ts`
- [ ] Replace bare `try/catch` with `Effect.tryPromise({ try, catch })` at every boundary
- [ ] `Effect.catchTag` / `Effect.catchAll` at the stalker boundary — retry, skip, or notify

**Why here:** Once the stalker is in Effect, typed errors make retry/fallback logic clean to express.

---

## Phase 5 — Cron jobs

**Goal:** Replace `node-cron` with Effect-managed scheduled fibers.

- [x] `CronLayer` stub in `src/features/cron/index.ts`
- [ ] `Effect.repeat(job, Schedule.cron(expr))` replaces each `cron.schedule(expr, fn)`
- [ ] All jobs started as fibers inside the root scope

---

## Phase 6 — HTTP / API layer

**Goal:** Replace Express with `@effect/platform` `HttpRouter`.

- [x] `ApiLayer` stub in `src/features/api/index.ts`
- [ ] Rewrite `router.ts`, `duoq.ts`, `live.ts` as `HttpRouter` handlers — start with `/api/duoq`
- [ ] Typed schemas via `Schema` from `effect`
- [ ] CORS / request tracking as `HttpMiddleware`
- [ ] `HttpServer.serve` replaces `app.listen`

---

## Phase 7 — Discord bot

**Goal:** Wrap discord.js event handlers in Effect at the boundaries.

- [x] `DiscordService` tag + `sendMessage` stub in `src/features/discord/index.ts`
- [ ] Keep `discordx` decorators as-is — wrap command handler bodies only
- [ ] `Effect.runPromise(effect.pipe(Effect.provide(AppLayer)))` inside each command handler
- [ ] `sendDiscordMessages` → `Effect.flatMap(Discord, s => s.sendEmbed(...))`

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
