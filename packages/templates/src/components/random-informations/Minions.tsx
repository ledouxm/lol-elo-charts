import { css, cva, cx, sva } from "../../../styled-system/css";
import { DefaultProps } from "../utils";

export const Minions = ({ participant }: DefaultProps) => {
    const challenges = participant.challenges;

    const jungleCsBefore10Minutes = Math.round(challenges.jungleCsBefore10Minutes);

    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                p: "5px",
                pt: "0",
            })}
        >
            <table>
                <tr className={tableRow({})}>
                    <td>Total</td>
                    <td>{participant.totalMinionsKilled + participant.neutralMinionsKilled}</td>
                </tr>
                <tr className={tableRow({ small: true })}>
                    <td>Lane</td>
                    <td>{participant.totalMinionsKilled}</td>
                </tr>
                <tr className={tableRow({ small: true })}>
                    <td>Jungle</td>
                    <td>{participant.neutralMinionsKilled}</td>
                </tr>
            </table>
            <table>
                <tr className={cx(tableRow({}))}>
                    <td>At 10 minutes</td>
                    <td>{challenges.laneMinionsFirst10Minutes + jungleCsBefore10Minutes}</td>
                </tr>
                <tr className={tableRow({ small: true })}>
                    <td>Lane</td>
                    <td>{challenges.laneMinionsFirst10Minutes}</td>
                </tr>
                <tr className={tableRow({ small: true })}>
                    <td>Jungle</td>
                    <td>{jungleCsBefore10Minutes}</td>
                </tr>
            </table>
        </div>
    );
};

// totalAllyJungleMinionsKilled: 0
// totalEnemyJungleMinionsKilled: 0
// totalNeutralMinionsKilled: 0
// total

export const tableRow = cva({
    base: {
        whiteSpace: "nowrap",
        textAlign: "left",
        "& > td": {
            fontSize: "20px",
            fontWeight: "bold",
            textAlign: "right",
        },
        "& > td:first-child": {
            fontSize: "16px",
            textAlign: "left",
            pr: "40px",
            fontWeight: "light",
        },
    },
    variants: {
        small: {
            true: {
                "& > td": {
                    lineHeight: "20px",
                    color: "light-gray",
                    fontSize: "16px",
                    "&:first-child": {
                        pl: "10px",
                        fontSize: "14px",
                    },
                },
            },
        },
    },
});
