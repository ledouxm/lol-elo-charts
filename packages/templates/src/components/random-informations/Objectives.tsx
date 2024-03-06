import { css } from "../../../styled-system/css";
import { Flex } from "../../../styled-system/jsx";
import { DefaultProps } from "../utils";

export const Objectives = ({ match }: DefaultProps) => {
    const blueObjectives = match.info.teams[0].objectives;
    const redObjectives = match.info.teams[1].objectives;

    const hasBlueSideWon = match.info.teams[0].win;
    const winner = hasBlueSideWon ? "Blue side" : "Red side";

    const tr = css({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        fontWeight: "bold",
        fontSize: "25px",
        whiteSpace: "nowrap",
        px: "20px",
    });

    const td1 = css({
        color: "blue",
    });

    const td2 = css({
        color: "white",
        fontSize: "20px",
        fontWeight: "light",
        mx: "60px",
    });

    const td3 = css({
        color: "red",
    });

    return (
        <Flex flexDirection="column">
            <div
                className={css({
                    fontWeight: "light",
                    fontSize: "30px",
                    textAlign: "center",
                    color: hasBlueSideWon ? "blue" : "red",
                })}
            >
                {winner} won
            </div>
            <table
                className={css({
                    w: "100%",
                })}
            >
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.champion.kills}</td>
                    <td className={td2}>Kills</td>
                    <td className={td3}>{redObjectives.champion.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.horde.kills}</td>
                    <td className={td2}>Void Grubs</td>
                    <td className={td3}>{redObjectives.horde.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.riftHerald.kills}</td>
                    <td className={td2}>Rift Herald</td>
                    <td className={td3}>{redObjectives.riftHerald.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.dragon.kills}</td>
                    <td className={td2}>Dragon</td>
                    <td className={td3}>{redObjectives.dragon.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.baron.kills}</td>
                    <td className={td2}>Baron</td>
                    <td className={td3}>{redObjectives.baron.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.tower.kills}</td>
                    <td className={td2}>Towers</td>
                    <td className={td3}>{redObjectives.tower.kills}</td>
                </tr>
                <tr className={tr}>
                    <td className={td1}>{blueObjectives.inhibitor.kills}</td>
                    <td className={td2}>Inhibitors</td>
                    <td className={td3}>{redObjectives.inhibitor.kills}</td>
                </tr>
            </table>
        </Flex>
    );
};
