import {
    AnySide,
    DefaultProps,
    Participant,
    blueSide,
    getChampionImage,
    redSide,
    setContext,
    sortPlayersByTeamAndRole,
} from "./utils";
import { css, sva } from "../../styled-system/css";

export const MatchDamage = (props: DefaultProps) => {
    setContext(props);
    const { match, participant } = props;

    const sortedParticipants = sortPlayersByTeamAndRole(match.info.participants);

    const maxDamage = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions));
    const getDamagePercentage = (p: Participant) => p.totalDamageDealtToChampions / maxDamage;

    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "column",
                w: "100%",
                gap: "10px",
            })}
        >
            <Team
                players={sortedParticipants[100]}
                side={blueSide}
                participant={participant}
                getDamagePercentage={getDamagePercentage}
            />

            <Team
                players={sortedParticipants[200]}
                side={redSide}
                participant={participant}
                getDamagePercentage={getDamagePercentage}
            />
        </div>
    );
};

const Team = ({
    players,
    side,
    participant,
    getDamagePercentage,
}: {
    players: Participant[];
    side: AnySide;
    participant: Participant;
    getDamagePercentage: (p: Participant) => number;
}) => {
    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "column",
                w: "100%",
                margin: "5px 0 5px 5px",
                gap: "4px",
            })}
        >
            {players.map((p) => {
                const styles = playerRow({ side, isPlayer: p.puuid === participant.puuid });
                return (
                    <div key={p.puuid} className={styles.row}>
                        <img className={styles.champion} src={getChampionImage(p.championName)} />
                        <div className={styles.damage} style={{ width: getDamagePercentage(p) * 100 + "%" }}>
                            <div className={styles.text}>{p.totalDamageDealtToChampions.toLocaleString()}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const playerRow = sva({
    slots: ["row", "champion", "damage", "text"],
    base: {
        row: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            w: "100%",
        },
        champion: {
            w: "50px",
            h: "50px",
        },
        damage: {
            display: "flex",
            alignItems: "center",
            height: "40px",
            ml: "8px",
            mr: "10px",
        },
        text: {
            ml: "10px",
            color: "white",
            fontSize: "18px",
        },
    },
    variants: {
        side: {
            200: {
                damage: { bg: "red" },
            },
            100: {
                damage: { bg: "blue" },
            },
        },
        isPlayer: {
            true: { champion: { outline: "4px solid", outlineColor: "yellow" } },
        },
    },
});
