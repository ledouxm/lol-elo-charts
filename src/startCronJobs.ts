import { checkElo, getAndSaveApex, giveEveryone500Points } from "./routes";
import cron from "node-cron";
import cronstrue from "cronstrue";

export const startCronJobs = () => {
    const eloDelay = `*/${process.env.CRON_DELAY_SEC || 5} * * * *`;
    console.log("checking elo", cronstrue.toString(eloDelay));
    cron.schedule(eloDelay, () => checkElo());

    const everydayAtMidnight = "0 0 * * *";
    console.log("getting apex and generating recaps", cronstrue.toString(everydayAtMidnight));
    cron.schedule(everydayAtMidnight, () => getAndSaveApex());

    // console.log("giving everyone 500 golds everyday", cronstrue.toString(everydayAtMidnight));
    // cron.schedule(everydayAtMidnight, () => giveEveryone500Points());
};
