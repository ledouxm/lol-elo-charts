import { Box, Divider, LinearProgress, Tooltip, tooltipClasses, Typography } from "@mui/material";
import type Galeforce from "galeforce";
import type { Team } from "galeforce/dist/galeforce/interfaces/dto/riot-api/match-v5/match";
import type { ReactNode } from "react";
import VoidgrubIcon from "../../assets/voidgrub.svg?react";
import DrakeIcon from "../../assets/drake.svg?react";
import NashorIcon from "../../assets/nashor.svg?react";
import HeraldIcon from "../../assets/herald.svg?react";
import AtakhanIcon from "../../assets/atakhan.svg?react";
import TowerIcon from "../../assets/tower.svg?react";
import { ChampionIconWithLevel } from "@/components/ChampionIconWithLevel";
import { useDuoqDataQueryWithParams, type Participant } from "../utils";
import { KDA } from "./MatchPreview";
import { useQuery } from "@tanstack/react-query";
import {
    getDDUrl,
    getRuneIconImageData,
    getSummonerSpellIconUrl,
    type DDragonRuneGroup,
} from "@lol-elo-charts/shared/datadragon";

export const MatchDetails = ({ match }: { match: Galeforce.dto.MatchDTO }) => {
    return (
        <Box
            display="flex"
            flexDirection={"column"}
            gap={1}
            bgcolor="background.light"
            p={1}
            borderRadius={"0 0 8px 8px"}
        >
            <TeamDetails team={100} match={match} />
            <TeamDetails team={200} match={match} />
        </Box>
    );
};

const TeamDetails = ({ team, match }: { team: 100 | 200; match: Galeforce.dto.MatchDTO }) => {
    const participants = match.info.participants.filter((p) => p.teamId === team)!;
    const teamDetails = match.info.teams.find((t) => t.teamId === team)!;
    const hasWon = teamDetails?.win;

    const duoqDataQuery = useDuoqDataQueryWithParams();
    const summoner1 = duoqDataQuery.data?.summoner1.puuid;
    const summoner2 = duoqDataQuery.data?.summoner2.puuid;

    return (
        <Box>
            <Box display="flex" gap={3} alignItems={"center"}>
                <Box display="flex" alignItems="flex-end">
                    <Typography fontWeight="bold" fontSize="20px" color={hasWon ? "win.default" : "loss.default"}>
                        {hasWon ? "Victory" : "Defeat"}
                    </Typography>
                    <Typography ml="4px" variant="caption" mb="3px">
                        ({team === 100 ? "Blue side" : "Red side"})
                    </Typography>
                </Box>
                {teamDetails ? <TeamObjectives teamDetails={teamDetails} /> : null}
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                mt={1}
                bgcolor="background.lighter"
                boxShadow={1}
                // py={0.5}
                borderRadius={1}
            >
                {participants.map((p, index, list) => (
                    <>
                        <ParticipantRow
                            key={p.puuid}
                            participant={p}
                            match={match}
                            team={teamDetails}
                            isHighlighted={p.puuid === summoner1 || p.puuid === summoner2}
                        />
                        {index < list.length - 1 && <ParticipantDivider />}
                    </>
                ))}
            </Box>
        </Box>
    );
};

const ParticipantDivider = () => {
    return <Divider />;
};

const TeamObjectives = ({ teamDetails }: { teamDetails: Team }) => {
    return (
        <Box display="flex" gap={2}>
            <Objective
                icon={<VoidgrubIcon width="20px" color="#7c35f1" />}
                count={teamDetails.objectives.horde.kills}
            />
            <Objective icon={<DrakeIcon width="20px" color="#ffdc75" />} count={teamDetails.objectives.dragon.kills} />
            <Objective icon={<NashorIcon width="20px" color="#9c67f4" />} count={teamDetails.objectives.baron.kills} />
            <Objective
                icon={<HeraldIcon width="20px" color="#bd9af8" />}
                count={teamDetails.objectives.riftHerald.kills}
            />
            {(teamDetails.objectives as any).atakhan ? (
                <Objective
                    icon={<AtakhanIcon width="20px" color="#fff3d1" />}
                    count={(teamDetails.objectives as any).atakhan.kills}
                />
            ) : null}
            <Objective icon={<TowerIcon width="20px" color="#c8f4b4" />} count={teamDetails.objectives.tower.kills} />
        </Box>
    );
};

const Objective = ({ icon, count }: { icon: ReactNode; count: number }) => {
    return (
        <Box display="flex" alignItems="center" gap={0.1}>
            <Typography fontSize="16px">{count}</Typography>
            {icon}
        </Box>
    );
};

const ParticipantRow = ({
    participant,
    match,
    team,
    isHighlighted,
}: {
    participant: Participant;
    match: Galeforce.dto.MatchDTO;
    team: Team;
    isHighlighted: boolean;
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            px={0.5}
            py={0.5}
            sx={{
                background: isHighlighted
                    ? "linear-gradient(118deg, rgba(215, 237, 237, .16) -47.79%, rgba(204, 235, 235, 0))"
                    : undefined,
            }}
            // bgcolor={isHighlighted ? "background.default" : undefined}
            borderRadius={1}
        >
            <Box display="flex" alignItems="center" width="200px" gap={1}>
                <ChampionIconWithLevel champion={participant.championName} level={participant.champLevel} size={48} />
                <Typography
                    width="180px"
                    fontWeight={"bold"}
                    fontSize="14px"
                    noWrap
                    component="a"
                    href={`https://dpm.lol/${participant.riotIdGameName}-${participant.riotIdTagline}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {participant.riotIdGameName}
                </Typography>
            </Box>
            <Box
                display="flex"
                alignItems="center"
                gap={0.8}
                bgcolor="background.light"
                boxShadow={4}
                p={0.5}
                borderRadius={1}
            >
                <SummonerSpells participant={participant} />
                <Runes participant={participant} />
                <Box ml={1}>
                    <Items participant={participant} />
                </Box>
            </Box>
            <Box width="150px">
                <KDA participant={participant} />
            </Box>
            {team ? (
                <Box ml={1}>
                    <DamageAndKP participant={participant} match={match} team={team} />
                </Box>
            ) : null}
        </Box>
    );
};

export const SummonerSpells = ({ participant }: { participant: Pick<Participant, "summoner1Id" | "summoner2Id"> }) => {
    const url1Query = useQuery({
        queryKey: ["summoner-spell-icon", participant.summoner1Id],
        queryFn: () => getSummonerSpellIconUrl(participant.summoner1Id),
    });

    const url2Query = useQuery({
        queryKey: ["summoner-spell-icon", participant.summoner2Id],
        queryFn: () => getSummonerSpellIconUrl(participant.summoner2Id),
    });

    return (
        <Box display="flex" flexDirection="column">
            <Box component="img" src={url1Query.data} width="20px" />
            <Box component="img" src={url2Query.data} width="20px" />
        </Box>
    );
};

const Runes = ({ participant }: { participant: Participant }) => {
    const primaryRuneStyleId = participant.perks.styles[0].style;
    const primaryRuneId = participant.perks.styles[0].selections[0].perk;
    const secondaryRuneId = participant.perks.styles[1].style;

    const runesData = useQuery({
        queryKey: ["runes-data"],
        queryFn: () => getRuneIconImageData(),
    });

    const primaryRune = runesData.data ? getRuneUrl(runesData.data, primaryRuneStyleId, primaryRuneId) : null;
    const primaryRuneUrl = primaryRune ? "https://ddragon.leagueoflegends.com/cdn/img/" + primaryRune.icon : null;

    const secondaryRune = runesData.data ? getRuneUrl(runesData.data, secondaryRuneId) : null;
    const secondaryRuneUrl = secondaryRune ? "https://ddragon.leagueoflegends.com/cdn/img/" + secondaryRune.icon : null;

    return (
        <Box display="flex" flexDirection="column">
            {primaryRuneUrl ? <Box component="img" src={primaryRuneUrl} width="20px" /> : null}
            {secondaryRuneUrl ? <Box component="img" src={secondaryRuneUrl} width="20px" /> : null}
        </Box>
    );
};

const getRuneUrl = (runeData: DDragonRuneGroup[], styleId: number, runeId?: number) => {
    const style = runeData.find((r) => r.id === styleId);
    if (!style) return null;
    if (!runeId) return style;
    const rune = style.slots.flatMap((s) => s.runes).find((r) => r.id === runeId);
    return rune;
};

const Items = ({ participant }: { participant: Participant }) => {
    const urlQuery = useQuery({
        queryKey: ["dd-url"],
        queryFn: () => getDDUrl(),
    });

    if (!urlQuery.data) return null;

    const getItemImage = (itemId: number) => {
        if (itemId === 0) return "";
        return `${urlQuery.data}img/item/${itemId}.png`;
    };

    return (
        <Box display="flex" flexDirection={"column"}>
            <Box display="flex" gap={0.2}>
                <ItemOrFallback itemId={participant.item0} getItemImage={getItemImage} />
                <ItemOrFallback itemId={participant.item1} getItemImage={getItemImage} />
                <ItemOrFallback itemId={participant.item2} getItemImage={getItemImage} />
                <ItemOrFallback itemId={participant.item6} getItemImage={getItemImage} />
            </Box>
            <Box display="flex" gap={0.2} mt={0.2}>
                <ItemOrFallback itemId={participant.item3} getItemImage={getItemImage} />
                <ItemOrFallback itemId={participant.item4} getItemImage={getItemImage} />
                <ItemOrFallback itemId={participant.item5} getItemImage={getItemImage} />
            </Box>
        </Box>
    );
};

const ItemOrFallback = ({ itemId, getItemImage }: { itemId: number; getItemImage: (id: number) => string }) => {
    if (itemId === 0) return <Box width="20px" height="20px" bgcolor="background.dark" />;
    return <Box component="img" src={getItemImage(itemId)} width="20px" height="20px" />;
};

const DamageAndKP = ({
    participant,
    match,
    team,
}: {
    participant: Participant;
    match: Galeforce.dto.MatchDTO;
    team: Team;
}) => {
    const maxDamage = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions));
    const totalDamage = participant.totalDamageDealtToChampions;
    const damagePercentage = (totalDamage / maxDamage) * 100;
    const dpm = Math.round((participant.totalDamageDealtToChampions / match.info.gameDuration) * 60);

    const teamKills = team.objectives.champion.kills;
    const killParticipation = teamKills > 0 ? ((participant.kills + participant.assists) / teamKills) * 100 : 0;
    const kp = Math.round(killParticipation);

    return (
        <Box display="flex" gap={0.2} alignItems="center">
            <Box display="flex" alignItems="center" gap={0.3} width="50px" justifyContent={"flex-start"}>
                <Typography>{kp.toFixed(0)}%</Typography>
                <Typography color="text.secondary" fontSize="10px" mt="2px">
                    KP
                </Typography>
            </Box>
            <Box width="100px" px={2}>
                <Tooltip
                    slotProps={{
                        // &.MuiTooltip-popper['data-popper-placement^="top"] .MuiTooltip-tooltip
                        popper: {
                            sx: {
                                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                                    {
                                        mb: "2px",
                                    },
                            },
                        },
                    }}
                    title={
                        <Typography variant="caption" color="text.secondary" align="center">
                            {formatNumber(totalDamage)} ({dpm} DPM)
                        </Typography>
                    }
                    placement={"top"}
                >
                    <LinearProgress
                        variant="determinate"
                        value={damagePercentage}
                        sx={{ height: "12px", borderRadius: "6px", cursor: "pointer" }}
                    />
                </Tooltip>
                {/* <Typography variant="caption" color="text.secondary" align="center">
                    {formatNumber(totalDamage)} ({dpm} DPM)
                </Typography> */}
            </Box>
            {/* <Typography variant="body2">Total Damage: {totalDamage}</Typography> */}
        </Box>
    );
};

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
}
