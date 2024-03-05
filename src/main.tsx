import "./envVars";
import { db, initDb } from "./db/db";
import "./features/discord/discord";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { startCronJobs } from "./startCronJobs";

import { renderToString } from "react-dom/server";
import ts from "typescript";

import jsx from "jsx-template-engine";
import fs from "fs/promises";
import { Test } from "./features/details/test";
import { App } from "../templates/src/App";
import { MatchDamage } from "templates/src/components/MatchDamage";
import { getChampionAndSpellIconStaticData } from "./features/lol/icons";
import { match } from "./db/schema";
import { eq } from "drizzle-orm";
import { ReactNode } from "react";
import { getScreenshotBuffer } from "./features/details/browser";
const start = async () => {
    try {
        const { champions, summoners } = await getChampionAndSpellIconStaticData();

        const game = await db.select().from(match).where(eq(match.matchId, "EUW1_6842146488"));
        const details = game[0].details;
        // const result = ts.transpileModule(content, { compilerOptions });
        // console.log(result);

        const props = {
            champion: champions,
            summoner: summoners,
            match: details,
            participant: details.info.participants[0],
            version: "14.4.1",
        };

        await fs.writeFile("mock.json", JSON.stringify(props, null, 4));

        const htmlString = renderToString(
            (
                <MatchDamage
                    champion={champions}
                    summoner={summoners}
                    match={details}
                    participant={details.info.participants[0]}
                    version="14.4.1"
                />
            ) as ReactNode
        );

        const css = await loadCss();
        console.log(css);
        await getScreenshotBuffer({ html: htmlString, css, clip: { x: 0, y: 0, width: 700, height: 562 } });
        // await initDb();
        // await startDiscordBot();
        // startCronJobs();
        // makeRouter();
        // if (process.env.FORCE_RECAPS) {
        //     await getAndSaveApex();
        // }
    } catch (err) {
        console.log(err);
        // process.exit(1);
    }
};

const loadCss = async () => {
    const css = await fs.readFile("./templates/styled-system/styles.css", "utf-8");
    return css;
};

// const App = () => {
//     return <h1>Hello, World!</h1>;
// };

start();
