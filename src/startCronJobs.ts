import { giveEveryone500Points } from "./features/summoner";
import { getAndSaveApex } from "./features/apex";
import { checkBets, checkElo } from "./features/elo";
import cron from "node-cron";
import cronstrue from "cronstrue";

export const startCronJobs = () => {
    const eloDelay = `*/${process.env.CRON_RANK_DELAY_MIN || 5} * * * *`;
    console.log("checking elo", cronstrue.toString(eloDelay));
    cron.schedule(eloDelay, () => checkElo());

    const betDelay = `*/${process.env.CRON_BETS_DELAY_MIN || 5} * * * *`;
    console.log("checking bets", cronstrue.toString(betDelay));
    cron.schedule(betDelay, () => checkBets());

    const everydayAtMidnight = "0 0 * * *";
    console.log("getting apex and generating recaps", cronstrue.toString(everydayAtMidnight));
    cron.schedule(everydayAtMidnight, () => getAndSaveApex());

    // console.log("sending daily recaps to everyone with charts", cronstrue.toString(everydayAtMidnight));
    // cron.schedule(everydayAtMidnight, () => getAndSaveApex());

    // console.log("giving everyone 500 golds everyday", cronstrue.toString(everydayAtMidnight));
    // cron.schedule(everydayAtMidnight, () => giveEveryone500Points());
};
