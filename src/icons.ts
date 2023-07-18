import axios from "axios";

export const getProfileIconUrl = async (icon: string | number) => {
    const ddVersion = await getDDVersion();

    return `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/profileicon/${icon}.png`;
};

const ref = {
    version: null,
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
