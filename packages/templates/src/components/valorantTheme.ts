// Shared Valorant canvas theme
export const MVP = "#f5c26b";
export const WIN = "#3ad6a0";
export const LOSS = "#ff4655";
export const DRAW = "#a8b2bb";
export const BEST = "#4ee6a8";
export const WORST = "#ff6b73";

export type ValorantResult = "win" | "loss" | "draw";

export const resultColor: Record<ValorantResult, string> = {
    win: WIN,
    loss: LOSS,
    draw: DRAW,
};

export const resultLabel: Record<ValorantResult, string> = {
    win: "Victory",
    loss: "Defeat",
    draw: "Draw",
};

export const extremeColor = (value: number, max: number, min: number) =>
    max === min ? undefined : value === max ? BEST : value === min ? WORST : undefined;

const MAP_UUID: Record<string, string> = {
    Ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
    Split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
    Fracture: "b529448b-4d60-346e-e89e-00a4c527a405",
    Bind: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
    Breeze: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
    District: "690b3ed2-4dff-945b-8223-6da834e30d24",
    Kasbah: "12452a9d-48c3-0b02-e7eb-0381c3520404",
    Piazza: "de28aa9b-4cbe-1003-320e-6cb3ec309557",
    Lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
    Pearl: "fd267378-4d1d-484f-ff52-77821ed10dc2",
    Icebox: "e2ad5c54-4114-a870-9641-8ea21279579a",
    Haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
    Abyss: "224b0a95-48b9-f703-1bd8-67aca101a61f",
    Sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498",
    Corrode: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
};

export const getValorantMapImage = (name?: string) => {
    const uuid = name ? MAP_UUID[name] : undefined;
    return uuid ? `https://media.valorant-api.com/maps/${uuid}/splash.png` : undefined;
};
