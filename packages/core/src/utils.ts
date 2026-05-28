import { ENV } from "./envVars";
import { InsertRank } from "./db/schema";
import debug from "debug";

debug.enable(ENV.DEBUG);
const baseDebug = debug("elo-stalker");

export const makeDebug = (suffix: string) => baseDebug.extend(suffix);

export type MinimalRank = Pick<InsertRank, "leaguePoints"> & { tier: string; division: string };

const winColor = 0x00ff26;
const lossColor = 0xff0000;

export const getColor = (isLoss: boolean) => (isLoss ? lossColor : winColor);
