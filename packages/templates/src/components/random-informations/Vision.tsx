import { css } from "../../../styled-system/css";
import { DefaultProps, ordinalSuffixOf } from "../utils";
import { tableRow } from "./Minions";

export const Vision = ({ participant, match }: DefaultProps) => {
    const participantTeam = match.info.participants.find((p) => p.summonerName === participant.summonerName)?.teamId;
    const teammates = match.info.participants.filter((p) => p.teamId === participantTeam);
    const opponent = match.info.participants
        .filter((p) => p.teamId !== participantTeam)
        .find((p) => p.teamPosition === participant.teamPosition);

    const visionScore = participant.visionScore;
    const totalVisionScore = teammates.reduce((acc, teammate) => {
        return acc + teammate.visionScore;
    }, 0);
    const teamVisionScorePercentage = Math.round((visionScore / totalVisionScore) * 100);

    const teamVisionRanking =
        teammates
            .sort((a, b) => b.visionScore - a.visionScore)
            .findIndex((p) => p.summonerName === participant.summonerName) + 1;

    const wardsPlaced = participant.wardsPlaced;
    const wardsKilled = participant.wardsKilled;
    const visionWardsBoughtInGame = participant.visionWardsBoughtInGame;
    const wardsGuarded = participant.challenges.wardsGuarded;

    return (
        <div>
            <table className={css({ w: "100%" })}>
                <tr className={tableRow({})}>
                    <td>Vision score</td>
                    <td>{visionScore}</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Difference with opponent</td>
                    <td>{Math.round(participant.challenges.visionScoreAdvantageLaneOpponent * 100)}%</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Percentage of team's vision score</td>
                    <td>{teamVisionScorePercentage}%</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Vision rank in team</td>
                    <td>{ordinalSuffixOf(teamVisionRanking)}</td>
                </tr>
            </table>

            <table className={css({ w: "100%", mt: "15px" })}>
                <tr className={tableRow({})}>
                    <td>Wards placed</td>
                    <td>{wardsPlaced}</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Wards killed</td>
                    <td>{wardsKilled}</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Vision wards bought</td>
                    <td>{visionWardsBoughtInGame}</td>
                </tr>
                <tr className={tableRow({})}>
                    <td>Wards guarded</td>
                    <td>{wardsGuarded}</td>
                </tr>
            </table>
        </div>
    );
};

/**
 * 
 * "visionScore": 19,
 * "visionWardsBoughtInGame": 2,

    
"wardsKilled": 2,
"wardsPlaced": 9,
"challenges.wardsGuarded": 0

*/
