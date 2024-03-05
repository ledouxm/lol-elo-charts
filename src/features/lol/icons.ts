import axios from "axios";
import { CanvasRenderingContext2D, Image, loadImage } from "canvas";
import { assign, createActor, createMachine, fromPromise, setup } from "xstate";

export const getChampionAndSpellIconStaticData = async () => {
    const ddVersion = await getDDVersion();
    const [champions, summoners] = await Promise.all([
        axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`),
        axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/summoner.json`),
    ]);

    return {
        champions: champions.data.data,
        summoners: summoners.data.data,
    };
};

export const getProfileIconUrl = async (icon: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/profileicon/${icon}.png`;
};

export const getChampionIconUrl = async (championName: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${championName}.png`;
};

export const getItemIconUrl = async (itemId: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/item/${itemId}.png`;
};

export const getSummonerSpellIconUrl = async (spellId: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${spellId}`;
};

export const getChampionById = async (id: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.champions) return ref.champions[id];

    const resp = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`);
    const data = resp.data.data;
    ref.champions = data;

    return Object.values(data).find((c: any) => c.key == id) as any;
};

export const getSummonerSpellIconImageData = async (spellId: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.summoners) return ref.summoners[spellId];

    const resp = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/summoner.json`);
    const data = resp.data.data;
    ref.summoners = Object.entries(data).reduce((acc, [_, value]: any) => {
        return { ...acc, [value.key]: value.image };
    }, {});

    return ref.summoners[spellId];
};

export const getItemIconImageData = async (itemId: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.items) return ref.items[itemId];

    const resp = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/item.json`);
    const data = resp.data.data;
    ref.items = Object.entries(data).reduce((acc, [key, value]: any) => {
        return { ...acc, [key]: value.image };
    }, {});

    return ref.items[itemId];
};

const ref = {
    version: null,
    champions: null,
    summoners: null,
    items: null,
};

setInterval(async () => {
    ref.version = null;
    ref.champions = null;
    ref.summoners = null;
    ref.items = null;
}, 1000 * 60 * 60);

export const getDDVersion = async () => {
    if (!ref.version) {
        const resp = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
        ref.version = resp.data[0];
    }

    return ref.version;
};

export class DDImageLoader {
    cache: Record<string, Image> = {};

    constructor() {
        setInterval(() => this.clear(), 1000 * 60 * 60 * 24);
    }

    async loadImage(url: string) {
        const fullUrl = url.includes("https://")
            ? url
            : `https://ddragon.leagueoflegends.com/cdn/${await getDDVersion()}/img/${url}`;

        if (this.cache[fullUrl]) return this.cache[fullUrl];

        const image = await loadImage(fullUrl);
        this.cache[fullUrl] = image;

        return image;
    }

    async drawSprite(
        ctx: CanvasRenderingContext2D,
        imageData: DDImage,
        ...args: [dx: number, dy: number, dw: number, dh: number]
    ) {
        if (!imageData) {
            ctx.fillStyle = "black";
            ctx.fillRect(...args);
            return;
        }

        const image = await this.loadImage(`sprite/${imageData.sprite}`);
        const spriteArgs = [imageData.x, imageData.y, imageData.w, imageData.h] as const;

        ctx.drawImage(image, ...spriteArgs, ...args);
    }

    clear() {
        this.cache = {};
    }
}

type DDImage = { full: string; sprite: string; group: string; x: 0; y: 0; w: 48; h: 48 };
