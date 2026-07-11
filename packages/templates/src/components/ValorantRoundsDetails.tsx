import { ValorantSide, getParticipantTeam, setValorantContext, type DefaultValorantProps } from "./utils";
import { Round } from "./utils";
import { WIN, LOSS } from "./valorantTheme";
import { RoundEndIcon } from "./valorantIcons";
import { container, track, header, divider, roundBox } from "./ValorantRoundsDetails.styles";
import { Fragment } from "react";

export const ValorantRoundsDetails = (props: DefaultValorantProps) => {
    setValorantContext(props);

    const { match, participant } = props;
    const rounds = match.rounds;
    const participantTeam = getParticipantTeam(participant, match);

    const won = rounds.filter((r) => r.winning_team === participantTeam).length;
    const lost = rounds.length - won;

    return (
        <div className={container}>
            <div className={header.wrap}>
                <span className={header.title}>Round History</span>
                <span className={header.score}>
                    <span style={{ color: WIN }}>{won}</span>
                    <span className={header.sep}>-</span>
                    <span style={{ color: LOSS }}>{lost}</span>
                </span>
            </div>
            <RoundsHistory rounds={rounds} participantTeam={participantTeam} />
        </div>
    );
};

const RoundsHistory = ({
    rounds,
    participantTeam,
}: {
    rounds: Round;
    participantTeam: ValorantSide;
}) => {
    return (
        <div className={track}>
            {rounds.map((r, index) => {
                const won = participantTeam === r.winning_team;
                const styles = roundBox({ playerWon: won });
                const showDivider = index === 11 || (index > 23 && index % 2 === 0);
                return (
                    <Fragment key={index}>
                        <div className={styles.round} style={{ borderColor: won ? WIN : LOSS }}>
                            <span className={styles.number}>{index + 1}</span>
                            <span className={styles.icon} style={{ color: won ? WIN : LOSS }}>
                                <RoundEndIcon type={r.end_type} />
                            </span>
                        </div>
                        {showDivider && (
                            <div className={divider.wrap}>
                                <div className={divider.line} />
                                <span className={divider.label}>{index === 11 ? "HT" : "OT"}</span>
                                <div className={divider.line} />
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
};
