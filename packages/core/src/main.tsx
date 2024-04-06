import "./envVars";
import { initDb } from "./db/db";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { lolStalker } from "./features/stalker/lol/lol";
import { startCronJobs } from "./startCronJobs";
import { valorantApi } from "./valorantApi";
import { ValorantService } from "./features/stalker/valorant/ValorantService";
import fs from "fs/promises";
const start = async () => {
    // const content = await ValorantService.getContent();
    const player = await ValorantService.getPlayerByName("MENACE DE MORT#QLF");
    const mmr = await ValorantService.getPlayerCurrentMmr(player.puuid);
    const lastGame = await ValorantService.getLastGame(player.puuid);
    // const winrate = await ValorantService.getWinrate(player.puuid);
    const result = { player, mmr, lastGame };
    // console.log(result);
    await fs.writeFile("valorant.json", JSON.stringify(result, null, 2));

    console.log("done");
    // await initDb();
    // await startDiscordBot();
    // startCronJobs();
    // makeRouter();
    // await lolStalker.start();

    // if (process.env.FORCE_RECAPS) {
    //     await getAndSaveApex();
    // }
};

try {
    start();
} catch (err) {
    console.log(err);
    process.exit(1);
}
