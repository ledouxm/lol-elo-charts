import { setValorantContext, type DefaultValorantProps } from './utils';
import { Flex } from "../../styled-system/jsx";
import { sva, css } from "../../styled-system/css";
import {
    ValorantParticipant,
    sortByCombatScore,
    computeAverageCombatScore,
    markPremades,
    computeHsPercentage,
    computeEconRating,
    getValorantRankImage
} from "./utils";

export const ValorantMatchDetails = (props: DefaultValorantProps) => {
    setValorantContext(props);

    const { match, participant } = props;
    const premades = markPremades(match.players.all_players);
    const sortedPlayers = sortByCombatScore(premades);
    const hasBlueSideWon = match.teams.blue.has_won;
    const rounds = {
        "red": match.teams.red.rounds_won,
        "blue": match.teams.blue.rounds_won
    };


    console.log(match);
    // console.log(participant);
    // console.log(players);
    // console.log(sortedPlayers);
    // console.log(premades);
    return (
        <Flex flexDirection="column" justifyContent="space-between" w="700px" p="5px">
            <Team
                players={sortedPlayers["Blue"]}
                participant={participant}
                isWinner={hasBlueSideWon}
                rounds={rounds}
            />
            <Team
                players={sortedPlayers["Red"]}
                participant={participant}
                isWinner={!hasBlueSideWon}
                rounds={rounds}
            />
        </Flex>
    );

};

const Team = ({
    players,
    participant,
    isWinner,
    rounds,
}: {
    players: ValorantParticipant[];
    participant: ValorantParticipant;
    isWinner: boolean;
    rounds: any;
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
                    alignSelf: "flex-middle",
                })}
            >
                {isWinner ? "Victory - " : "Defeat - "} 

                {isWinner ? rounds.blue : rounds.red}
            </div>
            {players.map((p) => {
                const styles = playerRow({ isPlayer: p.puuid === participant.puuid });
                // @ts-ignore - Galeforce DataDragon types are wrong
                const name = p.name;
                return (
                    <div className={styles.row} key={p.puuid} style={{ backgroundColor: p.isPremade }}>
                        <div className={styles.agentScores}>
                            <img className={styles.agent} src={p.assets.agent.small} />

                            <div className={styles.scores}>
                                <div className={styles.name}>{name}</div>
                                <div className={styles.stats}>
                                    <div className={styles.kda}>
                                        <span className={styles.kills}>{p.stats.kills}</span>/
                                        <span className={styles.deaths}>{p.stats.deaths}</span>/
                                        <span className={styles.assists}>{p.stats.assists}</span>
                                    </div>
                                    <div className={styles.acs}>
                                        {computeAverageCombatScore(p.stats.score, rounds.red + rounds.blue).toFixed(0)} ACS
                                    </div>
                                    <div className={styles.hsp}>
                                        {computeHsPercentage(p.stats.bodyshots, p.stats.headshots, p.stats.legshots)}% HS
                                    </div>
                                    <div className={styles.econRating}>
                                        {computeEconRating(p.damage_made, p.economy.spent.overall)} ER
                                    </div>

                                </div>

                            </div>
                        </div>
                        <img className={styles.rank} src={getValorantRankImage(p.currenttier)} />


                    </div>

                );
            })}





        </div>
    );






};


const playerRow = sva({
    slots: [
        "row",
        "agentDiv",
        "agent",
        "stats",
        "agentScores",
        "name",
        "scores",
        "kda",
        "kills",
        "deaths",
        "assists",
        "acs",
        "hsp",
        "econRating",
        "rank"
    ],
    base: {
        row: {
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",

        },

        agent: {
            width: "60px",
            height: "60px",
        },
        agentScores: {
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",

        },
        scores: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
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
        stats: {
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
        acs: {
            color: "white",
            fontSize: "20px",
        },
        hsp: {
            color: "white",
            fontSize: "20px",
        },
        econRating: {
            color: "white",
            fontSize: "20px",
        },
        rank: {
            width: "50px",
            height: "50px",

        }
    },

    variants: {
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
