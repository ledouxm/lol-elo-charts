import { Awaitable, Message, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import { bot, sendToChannelId } from "../discord/discord";
import { makeDebug } from "@/utils";

export class Stalker<Player extends StalkerPlayer, Match, RemoteRank, DbRank> {
    private interval1: NodeJS.Timeout | null = null;
    private interval2: NodeJS.Timeout | null = null;

    private playersPool: Player[] = [];
    private allPlayers = new Map<string, Player>();
    private hasLoggedEnd = false;
    private currentChanges: StalkerChange<Player, Match, RemoteRank, DbRank>[] = [];

    private debug: debug.Debugger;

    constructor(public options: StalkerOptions<Player, Match, RemoteRank, DbRank>) {
        this.debug = makeDebug(this.options.debugNamespace || "stalker");
    }

    async start() {
        this.debug("Stalker start");

        await this.appendPlayersToFetch();

        const nbIterations = Math.floor(this.options.discordNotificationInterval / this.options.playerRequestInterval);
        this.debug("Fetching players every", Math.round(this.options.playerRequestInterval / 1000), "s");
        this.debug("Sending notifications every", Math.round(this.options.discordNotificationInterval / 1000), "s");
        this.debug(`=> Can fetch up to ${nbIterations} players per notification`);

        if (this.playersPool.length > nbIterations) {
            this.debug(
                `⚠️ Every player will not be fetched between each notification (pool size: ${this.playersPool.length}, iterations per notification: ${nbIterations})`
            );
        }

        this.interval1 = setInterval(() => this.getPlayerNewRankAndPop(), this.options.playerRequestInterval);
        this.interval2 = setInterval(() => this.commitChanges(), this.options.discordNotificationInterval);
    }

    saveAllPlayers(players: Player[]) {
        for (const player of players) {
            this.allPlayers.set(this.options.getPlayerId({ player }), player);
        }

        this.debug(this.allPlayers);
    }

    private areSamePlayers = (p1: Player, p2: Player) =>
        this.options.getPlayerId({ player: p1 }) === this.options.getPlayerId({ player: p2 });

    async appendPlayersToFetch() {
        const allPlayers = await this.options.getPlayers();
        this.debug(allPlayers);

        this.saveAllPlayers(allPlayers);

        const newPlayers = allPlayers.filter((p) => !this.playersPool.find((p2) => this.areSamePlayers(p, p2)));

        this.debug(
            `Adding ${newPlayers.length} players to the pool (total: ${this.playersPool.length + newPlayers.length})`
        );
        this.playersPool.push(...newPlayers);
        this.hasLoggedEnd = false;
    }

    async getPlayerNewRankAndPop() {
        const player = this.playersPool.shift();

        if (!player) {
            if (!this.hasLoggedEnd) {
                this.debug("No more players to fetch");
                this.hasLoggedEnd = true;
            }
            return;
        }

        this.getPlayerNewRank({ player });
    }

    async getPlayerNewRank({ player }: { player: Player; ignoredPlayerIds?: Set<string> }) {
        const playerDebug = this.debug.extend(this.options.getPlayerName({ player }));

        playerDebug("Fetching new rank");

        const rank = await this.options.getRank({ player });
        if (!rank) return void playerDebug("No rank");
        playerDebug("Current rank", this.options.formatRank(rank));

        const match = await this.options.getLastMatch({ player });

        if (match) {
            await this.addOtherParticipantsInGameToPool({ currentPlayer: player, match, playerDebug });
        }

        const lastRank = await this.options.getLastRank({ player });
        playerDebug(this.options.formatRank(lastRank), " > ", this.options.formatRank(rank));

        const shouldSkip = this.options.areRanksEqual({ lastRank, newRank: rank });
        if (shouldSkip) return;

        this.currentChanges.push({
            player,
            lastMatch: match,
            lastRank,
            newRank: rank,
        });
    }

    async addOtherParticipantsInGameToPool({
        currentPlayer,
        match,
        playerDebug,
    }: {
        currentPlayer: Player;
        match: Match;
        playerDebug: debug.Debugger;
    }) {
        for (const player of Object.values(Object.fromEntries(this.allPlayers))) {
            if (this.areSamePlayers(currentPlayer, player)) continue;

            // not in game, skipping
            if (!this.options.isPlayerInGame({ player, match })) continue;

            const playerName = this.options.getPlayerName({ player });
            // already going to be fetched, moving to front
            if (this.playersPool.find((p) => this.areSamePlayers(p, player))) {
                playerDebug(`Player ${playerName} already in pool, moving to front`);
                this.playersPool = [player, ...this.playersPool.filter((p) => !this.areSamePlayers(p, player))];
                continue;
            }

            // already fetched, skipping
            if (this.currentChanges.find((c) => this.areSamePlayers(c.player, player))) {
                playerDebug(`Player ${playerName} already in changes, skipping`);
                continue;
            }

            playerDebug(`[DUOQ] Adding player ${playerName} to pool`);
            this.playersPool.push(player);
        }
    }

    async commitChanges() {
        await this.sendDiscordMessages();
        await this.appendPlayersToFetch();
    }

    async sendDiscordMessages() {
        const messages = await this.options.getDiscordMessages({
            changes: this.currentChanges,
        });

        if (!messages || messages.length === 0) {
            this.debug("Nothing has changed");
            return;
        }

        for (const message of messages) {
            await this.sendToChannelId({ channelId: message.channelId, message });
        }

        this.debug("Persisting changes");
        await this.options.persistChanges({ changes: this.currentChanges, debug: this.debug });
        this.currentChanges = [];
    }

    async sendToChannelId({ channelId, message }: { channelId: string; message: MessageCreateOptions }) {
        try {
            const channel = bot.channels.cache.get(channelId);
            if (!channel) {
                this.debug("Could not find channel", channelId);
                return;
            }

            this.debug("Sending to channel", channelId);

            return (channel as TextChannel).send(message);
        } catch (e) {
            this.debug("Error sending to channel", channelId, e);
        }
    }

    stop() {
        if (this.interval1) clearInterval(this.interval1);
        if (this.interval2) clearInterval(this.interval2);

        this.interval1 = null;
        this.interval2 = null;
    }
}

interface StalkerOptions<Player extends StalkerPlayer, Match, RemoteRank, DbRank> {
    getPlayers: () => Awaitable<Player[]>;
    getRank: ({ player }: { player: Player }) => Awaitable<RemoteRank | null>;
    getLastRank: ({ player }: { player: Player }) => Awaitable<DbRank>;
    getLastMatch: ({ player }: { player: Player }) => Awaitable<Match>;
    areRanksEqual: ({ lastRank, newRank }: { lastRank: DbRank; newRank: RemoteRank }) => boolean;
    getDiscordMessages: ({
        changes,
    }: {
        changes: StalkerChange<Player, Match, RemoteRank, DbRank>[];
    }) => Awaitable<StalkerMessage[]>;
    persistChanges: ({
        changes,
        debug,
    }: {
        changes: StalkerChange<Player, Match, RemoteRank, DbRank>[];
        debug: debug.Debugger;
    }) => Awaitable<void>;
    getPlayerName: ({ player }: { player: Player }) => string;
    formatRank: (rank: RemoteRank | DbRank) => string;
    getPlayerId: ({ player }: { player: Player }) => string;
    isPlayerInGame: ({ player, match }: { player: Player; match: Match }) => boolean;

    debugNamespace: string;
    playerRequestInterval: number;
    discordNotificationInterval: number;
}

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
