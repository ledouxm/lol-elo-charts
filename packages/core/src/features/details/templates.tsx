import Galeforce from "galeforce";
import { Participant } from "../summoner";
import { getChampionAndSpellIconStaticData } from "../lol/icons";
import * as components from "@lol-elo-charts/templates";
import { renderToString } from "react-dom/server";
import fs from "fs/promises";
import { getScreenshotBuffer } from "./browser";

export const generateTemplateBuffer = async ({
    match,
    participant,
    template,
}: {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
    template: Templates;
}) => {
    const templateProps = await getTemplateProps({ match, participant });
    const TemplateComponent = components[template];

    const html = renderToString(<TemplateComponent {...templateProps} />);
    const css = await loadCss();

    return getScreenshotBuffer({
        html,
        css,
        clip: { x: 0, y: 0, width: dimensions[template].width, height: dimensions[template].height },
    });
};

const dimensions: Record<Templates, { width: number; height: number }> = {
    MatchDamage: { width: 700, height: 562 },
    MatchDetails: { width: 700, height: 516 },
    MatchRandomInformations: { width: 800, height: 703 },
};

export type Templates = keyof typeof components;

const getTemplateProps = async ({
    match,
    participant,
}: {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
}) => {
    const staticProps = await getChampionAndSpellIconStaticData();
    return {
        match,
        participant,
        ...staticProps,
    };
};

const loadCss = async () => {
    const css = await fs.readFile("../templates/styled-system/styles.css", "utf-8");
    return css;
};
