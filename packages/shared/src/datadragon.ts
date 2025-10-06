import { ofetch } from "ofetch";

export const getChampionAndSpellIconStaticData = async () => {
    if (!ref.templateProps) {
        const ddVersion = await getDDVersion();
        const [champions, summoners, championFull] = await Promise.all([
            ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`),
            ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/summoner.json`),
            ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/championFull.json`),
        ]);

        ref.templateProps = {
            champion: champions.data,
            summoner: summoners.data,
            championFull: championFull.data,
            version: ddVersion,
        };
    }

    return ref.templateProps;
};

export const getProfileIconUrl = async (icon: string | number) => {
    const ddVersion = await getDDVersion();
    console.log(ddVersion);
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
    const spellIconData = await getSummonerSpellIconImageData(spellId);
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${spellIconData.full}`;
};

export const getChampionById = async (id: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.champions) return ref.champions[id];

    const resp = await ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`);
    const data = resp.data;
    ref.champions = data;

    return Object.values(data).find((c: any) => c.key == id) as any;
};

export const getSummonerSpellIconImageData = async (spellId: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.summoners) return ref.summoners[spellId];

    const resp = await ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/summoner.json`);
    const data = resp.data;
    ref.summoners = Object.entries(data).reduce((acc, [_, value]: any) => {
        return { ...acc, [value.key]: value.image };
    }, {});

    return ref.summoners[spellId] as DDragonImage;
};

export const getRuneIconImageData = async () => {
    const ddVersion = await getDDVersion();
    if (ref.runes) return ref.runes;

    const resp = await ofetch<DDragonRuneGroup[]>(
        `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/runesReforged.json`
    );
    ref.runes = resp;

    return ref.runes as DDragonRuneGroup[];
};

export const getItemIconImageData = async (itemId: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.items) return ref.items[itemId];

    const resp = await ofetch(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/item.json`);
    const data = resp.data;
    ref.items = Object.entries(data).reduce((acc, [key, value]: any) => {
        return { ...acc, [key]: value.image };
    }, {});

    return ref.items[itemId];
};

type DDragonImage = {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
};

export type DDragonRuneGroup = {
    id: number;
    key: string;
    icon: string;
    name: string;
    slots: { runes: DDragonRune }[];
};

type DDragonRune = {
    id: number;
    key: string;
    icon: string;
    name: string;
    shortDesc: string;
    longDesc: string;
};

const ref = {
    version: null,
    champions: null,
    summoners: null,
    items: null,
    runes: null,
    templateProps: null,
};

setInterval(async () => {
    ref.version = null;
    ref.champions = null;
    ref.summoners = null;
    ref.items = null;
    ref.runes = null;
}, 1000 * 60 * 60);

export const getDDVersion = async () => {
    if (!ref.version) {
        const resp = await ofetch("https://ddragon.leagueoflegends.com/api/versions.json");
        ref.version = resp[0];
    }

    return ref.version;
};

export const getDDUrl = async () => {
    const version = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${version}/`;
};
