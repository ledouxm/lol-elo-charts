import { Box, Flex } from "../../styled-system/jsx";
import { sva, css } from "../../styled-system/css";
import {
    AnySide,
    DefaultProps,
    Participant,
    getChampionImage,
    getSummonerSpellImage,
    setContext,
    sortPlayersByTeamAndRole,
    blueSide,
    getItemImage,
    redSide,
} from "./utils";

export const MatchDetails = (props: DefaultProps) => {
    setContext(props);

    const { match, participant } = props;
    const sortedParticipants = sortPlayersByTeamAndRole(match.info.participants);

    const hasBlueSideWon = match.info.teams[0].win;

    return (
        <Flex justifyContent="space-between" w="700px" p="5px">
            <Team
                side={blueSide}
                players={sortedParticipants[blueSide]}
                participant={participant}
                isWinner={hasBlueSideWon}
            />
            <Team
                side={redSide}
                players={sortedParticipants[redSide]}
                participant={participant}
                isWinner={!hasBlueSideWon}
            />
        </Flex>
    );
};

const Team = ({
    players,
    side,
    participant,
    isWinner,
}: {
    players: Participant[];
    side: AnySide;
    participant: Participant;
    isWinner: boolean;
}) => {
    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "column",
                gap: "5px",
            })}
        >
            <div
                className={css({
                    fontSize: "24px",
                    mt: "-5px",
                    color: isWinner ? "green" : "red",
                    alignSelf: side === blueSide ? "flex-start" : "flex-end",
                })}
            >
                {isWinner ? "Victory" : "Defeat"}
            </div>
            {players.map((p) => {
                const styles = playerRow({ side, isPlayer: p.puuid === participant.puuid });
                // @ts-ignore - Galeforce DataDragon types are wrong
                const name = p.riotIdGameName;
                return (
                    <div className={styles.row} key={p.puuid}>
                        <div className={styles.championAndSumms}>
                            <img className={styles.champion} src={getChampionImage(p.championName)} />
                            <div className={styles.summonerSpells}>
                                <img className={styles.summonerSpell} src={getSummonerSpellImage(p.summoner1Id)} />
                                <img className={styles.summonerSpell} src={getSummonerSpellImage(p.summoner2Id)} />
                            </div>
                        </div>
                        <div className={styles.scoresAndItems}>
                            <div className={styles.name}>{name}</div>
                            <div className={styles.scores}>
                                <div className={styles.kda}>
                                    <span className={styles.kills}>{p.kills}</span>/
                                    <span className={styles.deaths}>{p.deaths}</span>/
                                    <span className={styles.assists}>{p.assists}</span>
                                </div>
                                <div className={styles.creepScore}>
                                    {p.totalMinionsKilled + p.neutralMinionsKilled}cs
                                </div>
                            </div>
                            <div className={styles.items}>
                                <Item itemId={p.item0} className={styles.item} />
                                <Item itemId={p.item1} className={styles.item} />
                                <Item itemId={p.item2} className={styles.item} />
                                <Item itemId={p.item3} className={styles.item} />
                                <Item itemId={p.item4} className={styles.item} />
                                <Item itemId={p.item5} className={styles.item} />
                                <Item itemId={p.item6} className={styles.item} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Item = ({ itemId, className }: { itemId: number; className?: string }) => {
    if (itemId === 0) {
        return <Box className={className} />;
    }

    return <img className={className} src={getItemImage(itemId)} />;
};

const playerRow = sva({
    slots: [
        "row",
        "championAndSumms",
        "champion",
        "summonerSpells",
        "summonerSpell",
        "scoresAndItems",
        "name",
        "scores",
        "kda",
        "kills",
        "deaths",
        "assists",
        "creepScore",
        "items",
        "item",
    ],
    base: {
        row: {
            display: "flex",
            flexDirection: "row",
            gap: "10px",
        },
        championAndSumms: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        champion: {
            width: "60px",
            height: "60px",
        },
        summonerSpells: {
            display: "flex",
            flexDirection: "row",
        },
        summonerSpell: {
            width: "30px",
            height: "30px",
        },
        scoresAndItems: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "gray",
        },
        name: {
            fontSize: "20px",
            color: "white",
            alignSelf: "flex-start",
            pt: "0px",
            mb: "-9px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxW: "200px",
        },
        scores: {
            display: "flex",
            gap: "8px",
        },
        kda: { fontSize: "20px" },
        kills: {
            color: "green",
            mr: "3px",
        },
        deaths: {
            color: "red",
            mx: "3px",
        },
        assists: {
            color: "blue",
            ml: "3px",
        },
        creepScore: { alignSelf: "flex-end" },
        items: {
            display: "flex",
        },
        item: {
            background: "black",
            width: "30px",
            height: "30px",
        },
    },
    variants: {
        side: {
            200: {
                row: {
                    flexDirection: "row-reverse",
                },
                items: {
                    flexDirection: "row-reverse",
                },
                scores: {
                    flexDirection: "row-reverse",
                },
                name: {
                    alignSelf: "flex-end",
                },
            },
            100: {},
        },
        isPlayer: {
            true: {
                row: {
                    outline: "4px solid",
                    outlineColor: "yellow",
                },
            },
        },
    },
});
