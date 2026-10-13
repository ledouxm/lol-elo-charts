import { setValorantContext, type DefaultValorantProps } from './utils';
import {
    ValorantParticipant,
    ValorantSide,
    Round,
    getParticipantTeam,
    sortByCombatScore,
    computeAverageCombatScore,
    markPremades,
    computeHsPercentage,
    getValorantRankImage,
    getFirstBloodCounts
} from "./utils";
import {
    WIN,
    LOSS,
    resultColor,
    resultLabel,
    extremeColor,
    getValorantMapImage,
    type ValorantResult
} from "./valorantTheme";
import { RoundEndIcon } from "./valorantIcons";
import {
    GRID,
    container,
    header,
    teamBlock,
    teamHeader,
    colHead,
    playerRow,
    rounds as roundsCss
} from "./ValorantMatchDetails.styles";

type Extremes = { hsMax: number; hsMin: number; fbMax: number; fbMin: number };

export const ValorantMatchDetails = (props: DefaultValorantProps) => {
    setValorantContext(props);

    const { match, participant } = props;
    const players_with_fb = getFirstBloodCounts(match.kills, match.players.all_players);
    const premades = markPremades(players_with_fb);
    const sortedPlayers = sortByCombatScore(premades);

    const participantTeam = getParticipantTeam(participant, match);

    const blueWon = match.teams.blue.rounds_won;
    const redWon = match.teams.red.rounds_won;
    const totalRounds = blueWon + redWon;
    const isDraw = blueWon === redWon || (!match.teams.blue.has_won && !match.teams.red.has_won);
    const hasBlueSideWon = match.teams.blue.has_won;
    const blueResult: ValorantResult = isDraw ? "draw" : hasBlueSideWon ? "win" : "loss";
    const redResult: ValorantResult = isDraw ? "draw" : hasBlueSideWon ? "loss" : "win";
    const hsValues = players_with_fb
        .map((p) => computeHsPercentage(p.stats.bodyshots, p.stats.headshots, p.stats.legshots))
        .filter((v) => Number.isFinite(v));
    const fbValues = players_with_fb
        .map((p) => p.first_blood_count ?? 0)
        .filter((v) => Number.isFinite(v));
    const extremes: Extremes = {
        hsMax: hsValues.length ? Math.max(...hsValues) : 0,
        hsMin: hsValues.length ? Math.min(...hsValues) : 0,
        fbMax: fbValues.length ? Math.max(...fbValues) : 0,
        fbMin: fbValues.length ? Math.min(...fbValues) : 0,
    };

    const map = match.metadata?.map;
    const mode = match.metadata?.mode;
    const mapImage = getValorantMapImage(map);

    return (
        <div className={container}>
            <div
                className={header.wrap}
                style={
                    mapImage
                        ? {
                              backgroundImage: `linear-gradient(90deg, rgba(11,20,28,0.94) 32%, rgba(11,20,28,0.4)), linear-gradient(0deg, rgba(11,20,28,0.9), rgba(11,20,28,0.15)), url(${mapImage})`
                          }
                        : undefined
                }
            >
                <div className={header.meta}>
                    <div className={header.map}>{map ?? "Valorant"}</div>
                    <div className={header.mode}>{mode ?? "Competitive"}</div>
                </div>
                <div className={header.score}>
                    <span style={{ color: resultColor[blueResult] }}>{blueWon}</span>
                    <span className={header.colon}>:</span>
                    <span style={{ color: resultColor[redResult] }}>{redWon}</span>
                </div>
            </div>

            <Team
                players={sortedPlayers["Blue"]}
                result={blueResult}
                totalRounds={totalRounds}
                wonRounds={blueWon}
                extremes={extremes}
            />
            <Team
                players={sortedPlayers["Red"]}
                result={redResult}
                totalRounds={totalRounds}
                wonRounds={redWon}
                extremes={extremes}
            />

            <RoundsTimeline rounds={match.rounds} participantTeam={participantTeam} />
        </div>
    );

};

const RoundsTimeline = ({ rounds, participantTeam }: { rounds: Round; participantTeam: ValorantSide }) => (
    <div className={roundsCss.section}>
        <span className={roundsCss.label}>Rounds</span>
        <div className={roundsCss.track}>
            {rounds.map((r, index) => {
                const won = participantTeam === r.winning_team;
                const color = won ? WIN : LOSS;
                const tile = roundsCss.tile({ playerWon: won });
                return (
                    <div key={index} className={tile.box} style={{ borderColor: color }}>
                        <span className={tile.num}>{index + 1}</span>
                        <span className={tile.icon} style={{ color }}>
                            <RoundEndIcon type={r.end_type} size={13} />
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

const Team = ({
    players,
    result,
    totalRounds,
    wonRounds,
    extremes,
}: {
    players: ValorantParticipant[];
    result: ValorantResult;
    totalRounds: number;
    wonRounds: number;
    extremes: Extremes;
}) => {
    const accent = resultColor[result];
    return (
        <div className={teamBlock}>
            <div className={teamHeader.wrap} style={{ borderColor: accent }}>
                <div className={teamHeader.stripe} style={{ backgroundColor: accent }} />
                <span className={teamHeader.result} style={{ color: accent }}>
                    {resultLabel[result]}
                </span>
                <span className={teamHeader.record} style={{ color: accent }}>
                    {wonRounds}
                </span>
            </div>

            <div className={colHead.wrap} style={{ gridTemplateColumns: GRID }}>
                <span />
                <span className={colHead.label}>Player</span>
                <span className={colHead.stat}>K / D / A</span>
                <span className={colHead.stat}>ACS</span>
                <span className={colHead.stat}>HS%</span>
                <span className={colHead.stat}>FB</span>
            </div>
            {players.map((p) => {
                const styles = playerRow();
                const hsRaw = computeHsPercentage(p.stats.bodyshots, p.stats.headshots, p.stats.legshots);
                const hs = Number.isFinite(hsRaw) ? hsRaw : 0;
                const hsColor = extremeColor(hs, extremes.hsMax, extremes.hsMin);
                const fbColor = extremeColor(p.first_blood_count, extremes.fbMax, extremes.fbMin);
                return (
                    <div
                        className={styles.row}
                        key={p.puuid}
                        style={{ gridTemplateColumns: GRID, borderLeftColor: p.isPremade || "transparent" }}
                    >
                        <img className={styles.agent} src={p.assets.agent.small} />

                        <div className={styles.identity}>
                            <div className={styles.nameRow}>
                                <span className={styles.name}>{p.name}</span>
                                <span className={styles.tag}>#{p.tag}</span>
                            </div>
                            <div className={styles.rankRow}>
                                <img className={styles.rank} src={getValorantRankImage(p.currenttier)} />
                                <span className={styles.tier}>{p.currenttier_patched}</span>
                            </div>
                        </div>

                        <div className={styles.statCell}>
                            <div className={styles.kda}>
                                <span className={styles.kills}>{p.stats.kills}</span>
                                <span className={styles.slash}>/</span>
                                <span className={styles.deaths}>{p.stats.deaths}</span>
                                <span className={styles.slash}>/</span>
                                <span className={styles.assists}>{p.stats.assists}</span>
                            </div>
                        </div>

                        <div className={styles.statCell}>
                            <div className={styles.statValue}>
                                {computeAverageCombatScore(p.stats.score, totalRounds).toFixed(0)}
                            </div>
                        </div>

                        <div className={styles.statCell}>
                            <div className={styles.statValue} style={{ color: hsColor }}>
                                {hs}%
                            </div>
                        </div>

                        <div className={styles.statCell}>
                            <div className={styles.statValue} style={{ color: fbColor }}>
                                {p.first_blood_count}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
