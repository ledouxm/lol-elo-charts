import { Awaitable, Message, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import { bot, sendToChannelId } from "../discord/discord";
import { makeDebug } from "@/utils";
import { formatRank } from "./lol/rankUtils";

export class Stalker<Player extends StalkerPlayer, Match, RemoteRank, DbRank> {
    private interval1: NodeJS.Timeout | null = null;
    private interval2: NodeJS.Timeout | null = null;

    private playersPool: Player[] = [];
    private hasLoggedEnd = false;
    private currentChanges: StalkerChange<Player, Match, RemoteRank, DbRank>[] = [];

    private debug: debug.Debugger;

    constructor(public options: StalkerOptions<Player, Match, RemoteRank, DbRank>) {
        this.debug = makeDebug(this.options.debugNamespace || "stalker");
    }

    async start() {
        console.log("START");
        this.debug("Stalker start");

        await this.appendPlayersToFetch();

        const nbIterations = Math.floor(this.options.discordNotificationInterval / this.options.playerRequestInterval);
        this.debug("Fetching players every", Math.round(this.options.playerRequestInterval / 1000), "s");
        this.debug("Sending notifications every", Math.round(this.options.discordNotificationInterval / 1000), "s");
        this.debug(`=> Will fetch ${nbIterations} players per notification`);

        if (this.playersPool.length > nbIterations) {
            this.debug(
                `⚠️ Every player will not be fetched between each notification (pool size: ${this.playersPool.length}, iterations per notification: ${nbIterations})`
            );
        }

        this.interval1 = setInterval(() => this.getPlayerNewRankAndPop(), this.options.playerRequestInterval);
        this.interval2 = setInterval(() => this.commitChanges(), this.options.discordNotificationInterval);
    }

    async appendPlayersToFetch() {
        const newPlayers = (await this.options.getPlayers()).filter((p) => !this.playersPool.includes(p));
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

        const playerDebug = this.debug.extend(this.options.getPlayerName({ player }));
        playerDebug("Fetching new rank");

        const rank = await this.options.getRank({ player });
        if (!rank) return void playerDebug("No rank");
        playerDebug("Current rank", this.options.formatRank(rank));

        const match = await this.options.getLastMatch({ player });

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
