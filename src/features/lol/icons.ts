import axios from "axios";

export const getProfileIconUrl = async (icon: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/profileicon/${icon}.png`;
};

export const getChampionIconUrl = async (championName: string | number) => {
    const ddVersion = await getDDVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${championName}.png`;
};

export const getChampionById = async (id: string | number) => {
    const ddVersion = await getDDVersion();
    if (ref.champions) return ref.champions[id];

    const resp = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`);
    const data = resp.data.data;
    ref.champions = data;

    return Object.values(data).find((c: any) => c.key == id) as any;
};

const ref = {
    version: null,
    champions: null,
};

setInterval(async () => {
    ref.version = null;
}, 1000 * 60 * 60);

export const getDDVersion = async () => {
    if (!ref.version) {
        const resp = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
        ref.version = resp.data[0];
    }
    return ref.version;
};
