import { ChampionIconWithLevel } from "@/components/ChampionIconWithLevel";
import { alpha, Box, Divider, Tooltip, Typography, useTheme } from "@mui/material";
import type Galeforce from "galeforce";
import { useDuoqDataQueryWithParams, type Participant } from "../utils";
import { formatDistanceToNow } from "date-fns";

export const MatchPreview = ({ match }: { match: Galeforce.dto.MatchDTO }) => {
    const duoqData = useDuoqDataQueryWithParams();
    const summoner1 = duoqData.data?.summoner1.puuid;
    const summoner2 = duoqData.data?.summoner2.puuid;

    const participant1 = match.info.participants.find((p) => p.puuid === summoner1);
    const participant2 = match.info.participants.find((p) => p.puuid === summoner2);

    if (!participant1 || !participant2) return null;

    return (
        <Box display="flex" justifyContent={"space-between"} alignItems="center" position="relative">
            <ParticipantSummary participant={participant1} match={match} />
            <MatchTimestamp timestamp={match.info.gameEndTimestamp} duration={match.info.gameDuration} />
            <ParticipantSummary participant={participant2} match={match} isRightSide />
        </Box>
    );
};

const MatchTimestamp = ({ timestamp, duration }: { timestamp: number; duration: number }) => {
    const date = new Date(timestamp);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return (
        <Tooltip title={date.toLocaleString()} arrow>
            <Box
                boxShadow={4}
                textAlign="center"
                px={2}
                position={"absolute"}
                left="50%"
                top="50%"
                py={1}
                borderRadius="16px"
                style={{ transform: "translate(-50%, -50%)" }}
                bgcolor={(theme) => alpha(theme.palette.background.paper, 1)}
            >
                <Box>{`${minutes}:${seconds.toString().padStart(2, "0")}`}</Box>
                <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(date, { addSuffix: true })}
                </Typography>
            </Box>
        </Tooltip>
    );
};

export const KDA = ({ participant, isRightSide }: { participant: Participant; isRightSide?: boolean }) => {
    const kda = (participant.kills + participant.assists) / Math.max(1, participant.deaths);
    const kdaColor = getKDAColor(kda);
    return (
        <Box display="flex" alignItems="center" flexDirection={isRightSide ? "row-reverse" : "row"}>
            <Box display="flex" alignItems="center" gap={0.3} minWidth="70px" justifyContent="center">
                <Typography fontWeight="bold" component={"span"}>
                    {participant.kills}
                </Typography>
                <Slash />
                <Typography fontWeight="bold" component={"span"} color="loss.default">
                    {participant.deaths}
                </Typography>
                <Slash />
                <Typography fontWeight="bold" component={"span"}>
                    {participant.assists}
                </Typography>
            </Box>
            <Divider
                orientation="vertical"
                sx={{ display: "inline-block", mx: 1, height: "10px", verticalAlign: "middle" }}
            />
            <Box display="flex" alignItems="center" gap={0.3}>
                <Typography component={"span"} sx={{ color: kdaColor }}>
                    {kda.toFixed(2)}
                </Typography>
                <Typography component={"span"} color="text.secondary" fontSize="10px" mt="2px">
                    KDA
                </Typography>
            </Box>
        </Box>
    );
};

const getKDAColor = (kda: number) => {
    if (kda <= 1.5) return "#9b9c9e";
    if (kda <= 2.5) return "#a1e4f9";
    if (kda <= 4.5) return "#deccfb";
    return "#ffe8a3";
};

const Slash = () => <Typography component={"span"}>/</Typography>;

const ParticipantSummary = ({
    participant,
    match,
    isRightSide,
}: {
    participant: Participant;
    match: Galeforce.dto.MatchDTO;
    isRightSide?: boolean;
}) => {
    const hasWon = hasParticipantWon(participant.puuid, match);
    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1}
            flexDirection={isRightSide ? "row-reverse" : "row"}
            bgcolor={(theme: any) =>
                hasWon ? alpha(theme.palette.win.default, 0.3) : alpha(theme.palette.loss.default, 0.3)
            }
            flex="1"
            p={1}
        >
            <ChampionIconWithLevel champion={participant.championName} level={participant.champLevel} size={48} />
            <Box component="img" src={`https://dpm.lol/position/${participant.teamPosition}.svg`} />
            <KDA participant={participant} isRightSide={isRightSide} />
        </Box>
    );
};

const hasParticipantWon = (puuid: string, match: Galeforce.dto.MatchDTO) => {
    const participant = match.info.participants.find((p) => p.puuid === puuid)!;
    if (typeof participant.win === "boolean") return participant.win;

    const winningTeamId = match.info.teams.find((t) => t.win)?.teamId;
    if (!winningTeamId) return false;

    return participant.teamId === winningTeamId;
};
