import { Effect, Queue, Ref, Schedule, Duration, Option } from "effect";
import type { MessageCreateOptions } from "discord.js";

type StalkerOptions<Player extends StalkerPlayer, Match, RemoteRank, DbRank> = {
    getPlayers: Effect.Effect<Player[]>;
    getRank: (player: Player) => Effect.Effect<RemoteRank | null>;
    getLastRank: (player: Player) => Effect.Effect<DbRank>;
    getLastMatch: (player: Player) => Effect.Effect<Match>;
    areRanksEqual: (lastRank: DbRank, newRank: RemoteRank) => boolean;
    getDiscordMessages: (
        changes: StalkerChange<Player, Match, RemoteRank, DbRank>[]
    ) => Effect.Effect<StalkerMessage[]>;
    persistChanges: (changes: StalkerChange<Player, Match, RemoteRank, DbRank>[]) => Effect.Effect<void>;
    sendMessage: (message: StalkerMessage) => Effect.Effect<void>;
    getPlayerName: (player: Player) => string;
    formatRank: (rank: RemoteRank | DbRank) => string;
    playerRequestInterval: Duration.DurationInput;
    discordNotificationInterval: Duration.DurationInput;
};

export type StalkerChange<Player extends StalkerPlayer, Match, RemoteRank, DbRank> = {
    player: Player;
    lastMatch: Match;
    lastRank: DbRank;
    newRank: RemoteRank;
};

type StalkerPlayer = {
    channels: string[];
    lastGameId: string;
};

export type StalkerMessage = MessageCreateOptions & { channelId: string };

export const makeStalker = <Player extends StalkerPlayer, Match, RemoteRank, DbRank>(
    options: StalkerOptions<Player, Match, RemoteRank, DbRank>
) =>
    Effect.fn("makeStalker")(function* () {
        const playerQueue = yield* Queue.unbounded<Player>();
        const changesRef = yield* Ref.make<StalkerChange<Player, Match, RemoteRank, DbRank>[]>([]);

        const fillQueue = Effect.gen(function* () {
            // Drain any remaining unprocessed players before refilling
            yield* Queue.takeAll(playerQueue);
            const players = yield* options.getPlayers;
            yield* Queue.offerAll(playerQueue, players);
            yield* Effect.log(`Queue filled with ${players.length} players`);
        });

        const processNextPlayer = Effect.gen(function* () {
            const maybePlayer = yield* Queue.poll(playerQueue);
            if (Option.isNone(maybePlayer)) return;

            const player = maybePlayer.value;
            yield* Effect.log(`Fetching rank for ${options.getPlayerName(player)}`);

            const rank = yield* options.getRank(player);
            if (!rank) return;

            const [match, lastRank] = yield* Effect.all([options.getLastMatch(player), options.getLastRank(player)]);

            if (options.areRanksEqual(lastRank, rank)) return;

            yield* Ref.update(changesRef, (changes) => [
                ...changes,
                { player, lastMatch: match, lastRank, newRank: rank },
            ]);
        }).pipe(Effect.withSpan("processNextPlayer"));

        const commitChanges = Effect.gen(function* () {
            const changes = yield* Ref.getAndSet(changesRef, []);
            const messages = yield* options.getDiscordMessages(changes);

            if (messages.length === 0) {
                yield* Effect.log("Nothing has changed");
                yield* fillQueue;
                return;
            }

            yield* Effect.forEach(messages, options.sendMessage, { concurrency: "unbounded" });
            yield* options.persistChanges(changes);
            yield* fillQueue;
        }).pipe(Effect.withSpan("commitChanges"));

        yield* fillQueue;

        yield* Effect.all(
            [
                Effect.repeat(processNextPlayer, Schedule.spaced(options.playerRequestInterval)),
                Effect.repeat(commitChanges, Schedule.spaced(options.discordNotificationInterval)),
            ],
            { concurrency: "unbounded" }
        );
    });
