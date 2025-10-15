import { useQuery } from "@tanstack/react-query";
import { api, type LiveGameData, type LiveGameParticipant } from "./api";
import { Box, Dialog, Modal, Typography, type BoxProps } from "@mui/material";
import { ProfileCard } from "./ProfileCard";
import { getChampionById, getChampionIconUrl } from "@lol-elo-charts/shared/datadragon";
import { SummonerSpells } from "./match/MatchDetails";
import { useState } from "react";
import { Matches } from "./match/Matches";

export const SummonerLiveGame = ({ summoner }: { summoner: string }) => {
    const liveGameQuery = useQuery({
        queryKey: ["liveGame", summoner],
        queryFn: async () => {
            const data = await api.getLiveGameData(summoner);
            return data;
        },
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        enabled: !!summoner,
    });

    if (liveGameQuery.isLoading) return <div>Loading live game...</div>;
    if (liveGameQuery.isError) return <div>Error loading live game</div>;
    if (!liveGameQuery.data) return <div>No live game found</div>;

    const allowedGameModes = ["CLASSIC", "ARAM", "URF"];

    const is5v5 = allowedGameModes.includes(liveGameQuery.data.gameMode);
    if (!is5v5) {
        return <div>Only 5v5 games are supported</div>;
    }

    const blueTeam = liveGameQuery.data.participants.filter((p) => p.teamId === 100);
    const redTeam = liveGameQuery.data.participants.filter((p) => p.teamId === 200);

    const mainSummoner = liveGameQuery.data.participants.find((p) => p.duoqMatchSummary === null)!;

    return (
        <>
            <Box display="flex" gap={2} my={2} height="100%" flexDirection="column">
                <Box flex="1" display="flex">
                    <Box display="flex" gap={2} flex="1" p={1}>
                        {blueTeam.map((participant) => (
                            <Box key={participant.puuid}>
                                <SummonerCard participant={participant} mainSummoner={mainSummoner} />
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box flex="1" display="flex">
                    <Box display="flex" gap={2} flex="1" p={1}>
                        {redTeam.map((participant) => (
                            <Box key={participant.puuid}>
                                <SummonerCard participant={participant} mainSummoner={mainSummoner} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

const SummonerCard = ({
    participant,
    mainSummoner,
}: {
    participant: LiveGameParticipant;
    mainSummoner: LiveGameParticipant;
}) => {
    const { profileIconId, championId, duoqMatchSummary } = participant;

    return (
        <Box
            component="a"
            target="_blank"
            href={`/duoq?summoner1=${encodeURIComponent(mainSummoner.riotId)}&summoner2=${encodeURIComponent(
                participant.riotId
            )}`}
            width="230px"
            height="420px"
            maxHeight="420px"
            position="relative"
            zIndex="0"
            boxShadow={1}
            borderRadius={2}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            sx={{
                ":hover": { boxShadow: 3 },
                transition: "box-shadow 0.1s ease-in-out",
                cursor: "pointer",
            }}
        >
            <Box display="flex" flexDirection="column" alignItems="center" p={2} gap={1}>
                <ProfileCard
                    small
                    summoner={{
                        icon: profileIconId,
                        name: participant.riotId,
                        puuid: participant.puuid,
                    }}
                />
            </Box>

            {duoqMatchSummary ? (
                duoqMatchSummary.totalMatches === 0 ? (
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        p={2}
                        textAlign="center"
                        height="100%"
                        fontSize="16px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        You haven't played together yet
                    </Typography>
                ) : (
                    <DuoqSummary duoqMatchSummary={duoqMatchSummary} />
                )
            ) : null}

            <ChampionBackground championId={championId} zIndex={-1} />
        </Box>
    );
};

const DuoqSummary = ({
    duoqMatchSummary,
}: {
    duoqMatchSummary: NonNullable<LiveGameParticipant["duoqMatchSummary"]>;
}) => {
    const { totalMatches, wonTogether, playedWith, playedAgainst, p1WonAgainstP2 } = duoqMatchSummary;

    return (
        <Box display="flex" mt="30px" width="100%" height="100%" flexDirection="column">
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent={"center"} mb="20px">
                <Typography>Total games:</Typography>
                <Typography fontWeight="bold">{totalMatches}</Typography>
            </Box>
            {playedWith > 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    borderRadius="4px"
                    boxShadow={1}
                    p={1}
                    px={2}
                    m={1}
                    bgcolor="background.dark"
                >
                    <Typography mt="0" color="textSecondary">
                        Together
                    </Typography>
                    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between">
                        <Typography fontSize="16px">
                            {playedWith} game{playedWith !== 1 ? "s" : ""}{" "}
                        </Typography>
                        <PercentageCircle percentage={Math.round((wonTogether / playedWith) * 100)} size={50} />
                    </Box>
                </Box>
            ) : null}
            {playedAgainst > 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    borderRadius="4px"
                    boxShadow={1}
                    p={1}
                    px={2}
                    m={1}
                    bgcolor="background.dark"
                >
                    <Typography mt="0" color="textSecondary">
                        Against each other
                    </Typography>
                    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between">
                        <Typography fontSize="16px">
                            {playedAgainst} game{playedAgainst !== 1 ? "s" : ""}{" "}
                        </Typography>
                        <PercentageCircle percentage={Math.round((p1WonAgainstP2 / playedAgainst) * 100)} size={50} />
                    </Box>
                </Box>
            ) : null}
        </Box>
    );
};

const PercentageCircle = ({ percentage, size = 100 }: { percentage: number; size?: number }) => {
    return (
        <Box
            width={`${size}px`}
            height={`${size}px`}
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
                background: (theme) =>
                    `conic-gradient(${(theme.palette as any).win.default} ${percentage * 3.6}deg,
                ${(theme.palette as any).loss.default} ${percentage * 3.6}deg)`,
            }}
        >
            {percentage.toFixed(0)}%
        </Box>
    );
};

const ChampionBackground = ({ championId, ...props }: BoxProps & { championId: number }) => {
    const championQuery = useQuery({
        queryKey: ["champion", championId],
        queryFn: () => getChampionById(championId),
    });

    return (
        <Box
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            bgcolor="background.dark"
            sx={{
                cursor: "pointer",
                opacity: 0.1,
                backgroundImage: championQuery.data
                    ? `url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championQuery.data.id}_0.jpg')`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "8px",
            }}
            {...props}
        />
    );
};

// const mock = {
//     gameId: 7569197759,
//     mapId: 11,
//     gameMode: "CLASSIC",
//     gameType: "MATCHED",
//     gameQueueConfigId: 420,
//     participants: [
//         {
//             puuid: "ABV7-hF9WJBR-uQfosCZqI7ScGzOARmBw3kOxGGeEp8aqWzbZg1_AWACjnFDMrtbVT9S_vXrvBOWtQ",
//             teamId: 100,
//             spell1Id: 7,
//             spell2Id: 4,
//             championId: 117,
//             profileIconId: 6499,
//             riotId: "cloé#smack",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8214],
//                 perkStyle: 8200,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: null,
//         },
//         {
//             puuid: "UFSqz5DPRIjb5EWCOKf0BkOw2XHGKxKKN1IiRjrWLgWX7UqngcLo3FDOZa2n1xbV-OpTtEOXa8O8RQ",
//             teamId: 100,
//             spell1Id: 11,
//             spell2Id: 4,
//             championId: 246,
//             profileIconId: 6911,
//             riotId: "bekennen#00000",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8369],
//                 perkStyle: 8300,
//                 perkSubStyle: 8100,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "IHRz4g2GXjklWC-rcXZ8PwuMWJmZpXtmIJ5Zryim5XpzH0F0hF0sXWYPN_Gw50fXCxVirID5BFDm_g",
//             teamId: 100,
//             spell1Id: 21,
//             spell2Id: 4,
//             championId: 19,
//             profileIconId: 6220,
//             riotId: "reach higher#baus",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8008],
//                 perkStyle: 8000,
//                 perkSubStyle: 8400,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "p2OgZjp9pU3c8CwiXodyRO4sjx0ZqP5Q58LDF3cc3PSY01EbO9x2jHnH5OHM5gLl67DvcKbALEv4-g",
//             teamId: 100,
//             spell1Id: 14,
//             spell2Id: 4,
//             championId: 127,
//             profileIconId: 6923,
//             riotId: "GrimReaper#1508",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8112],
//                 perkStyle: 8100,
//                 perkSubStyle: 8200,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "IweUVzITKQ2pWd_r0ZsRhkyTw2rx1EBsV598zvVzY_Qv1QFSkHO8drxualutijyHfeIljorTjMHS0w",
//             teamId: 100,
//             spell1Id: 4,
//             spell2Id: 21,
//             championId: 523,
//             profileIconId: 6894,
//             riotId: "TheBigEichel#EUW",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8005],
//                 perkStyle: 8000,
//                 perkSubStyle: 8200,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 1,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 1,
//                 matchIds: ["EUW1_6992748351"],
//             },
//         },
//         {
//             puuid: "kixFtLoSO6kcQVOEGarbaQQWDKH9RA9lEPiwx0h72OdlltnEl0n0mhEFTwku7yyyg58rAnJboubwwA",
//             teamId: 200,
//             spell1Id: 12,
//             spell2Id: 4,
//             championId: 68,
//             profileIconId: 6900,
//             riotId: "R5 TOP OR DOOMED#xDDDD",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8229],
//                 perkStyle: 8200,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "p6zUcNAIuqqdNull0a8IJRIXEYy0ZcPyDf5_CcdnKh_r9FYYzasJFP4LU-PSZVI68WTzBwM5iRV11w",
//             teamId: 200,
//             spell1Id: 4,
//             spell2Id: 21,
//             championId: 901,
//             profileIconId: 3543,
//             riotId: "nicopico#187",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8021],
//                 perkStyle: 8000,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 2,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 1,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 1,
//                 playedWith: 1,
//                 matchIds: ["EUW1_7516726610", "EUW1_7516673485"],
//             },
//         },
//         {
//             puuid: "DvQohTDqe4CvGDgZJSmUzbAjLU9AViu0izfsVsMNf56RqQaqCZmLtMDuijqYUOvmhgc1lzvyF6o2ww",
//             teamId: 200,
//             spell1Id: 4,
//             spell2Id: 11,
//             championId: 234,
//             profileIconId: 907,
//             riotId: "lbn Battouta#EUW",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8010],
//                 perkStyle: 8000,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "dNHCGms8AOFHJl0GznSiPygd4hR77oXaXZa5WPjlVHBIEMc6U7beAj_vHh6Uw0nBl6XnnwO9tw9IRQ",
//             teamId: 200,
//             spell1Id: 4,
//             spell2Id: 12,
//             championId: 115,
//             profileIconId: 6102,
//             riotId: "Uhrensohn#omka",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8229],
//                 perkStyle: 8200,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//         {
//             puuid: "QSdW5nIP5MEYK_-BvtB-q1CVOaAXVPDxZDoWaffuIg082dygnxvQ33f71cLWNyTHkFFTnaBmHpPKhw",
//             teamId: 200,
//             spell1Id: 7,
//             spell2Id: 4,
//             championId: 432,
//             profileIconId: 6383,
//             riotId: "PafSupreme#BIGPA",
//             bot: false,
//             gameCustomizationObjects: [],
//             perks: {
//                 perkIds: [8112],
//                 perkStyle: 8100,
//                 perkSubStyle: 8300,
//             },
//             duoqMatchSummary: {
//                 totalMatches: 0,
//                 wonTogether: 0,
//                 p1WonAgainstP2: 0,
//                 p2WonAgainstP1: 0,
//                 playedAgainst: 0,
//                 playedWith: 0,
//                 matchIds: [],
//             },
//         },
//     ],
//     observers: {
//         encryptionKey: "iPOCRgm6laDNcMCcC2vZmrxLv2KPzfeN",
//     },
//     platformId: "EUW1",
//     bannedChampions: [
//         {
//             championId: 121,
//             teamId: 100,
//             pickTurn: 1,
//         },
//         {
//             championId: 119,
//             teamId: 100,
//             pickTurn: 2,
//         },
//         {
//             championId: 266,
//             teamId: 100,
//             pickTurn: 3,
//         },
//         {
//             championId: 90,
//             teamId: 100,
//             pickTurn: 4,
//         },
//         {
//             championId: 555,
//             teamId: 100,
//             pickTurn: 5,
//         },
//         {
//             championId: 18,
//             teamId: 200,
//             pickTurn: 6,
//         },
//         {
//             championId: 555,
//             teamId: 200,
//             pickTurn: 7,
//         },
//         {
//             championId: 157,
//             teamId: 200,
//             pickTurn: 8,
//         },
//         {
//             championId: 59,
//             teamId: 200,
//             pickTurn: 9,
//         },
//         {
//             championId: 8,
//             teamId: 200,
//             pickTurn: 10,
//         },
//     ],
//     gameStartTime: 1760550601165,
//     gameLength: 675,
// };
