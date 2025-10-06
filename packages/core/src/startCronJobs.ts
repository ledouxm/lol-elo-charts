import { getAndSaveApex } from "./features/lol/apex";
import { checkBets } from "./features/lol/elo";
import cron from "node-cron";
import cronstrue from "cronstrue";
import { clearRequests } from "./features/api/router";
import { ENV } from "./envVars";

export const startCronJobs = () => {
    const betDelay = `*/${ENV.CRON_BETS_DELAY_MIN} * * * *`;
    console.log("checking bets", cronstrue.toString(betDelay));
    cron.schedule(betDelay, () => checkBets());

    const everydayAtMidnight = "0 0 * * *";
    console.log("getting apex and generating recaps", cronstrue.toString(everydayAtMidnight));
    cron.schedule(everydayAtMidnight, () => getAndSaveApex(), { timezone: "Europe/Paris" });

    const every3Hours = "0 */3 * * *";
    console.log("clearing all requests in db", cronstrue.toString(every3Hours));
    cron.schedule(every3Hours, () => clearRequests());

    // const activeGameDelay = `*/${process.env.CRON_ACTIVE_GAME_DELAY_MIN || 5} * * * *`;
    // console.log("checking active games", cronstrue.toString(activeGameDelay));
    // cron.schedule(activeGameDelay, () => getInGameSummoners());
};
