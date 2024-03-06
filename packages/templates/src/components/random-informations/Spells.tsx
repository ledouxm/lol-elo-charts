import { css, cx } from "../../../styled-system/css";
import { sva } from "../../../styled-system/css/sva";
import { DefaultProps, getSpellImage, getSummonerSpellImage } from "../utils";
import { Spell } from "../../types";

export const Spells = ({ spells, participant }: { spells: Spell[] } & DefaultProps) => {
    const styles = spellStyles({});

    const nbSummSpell1 = participant.summoner1Casts;
    const nbSummSpell2 = participant.summoner2Casts;

    return (
        <div className={styles.root}>
            {spells.map((spell, index) => {
                return (
                    <div className={styles.container} key={spell.id}>
                        <img className={styles.image} src={getSpellImage(spell)} alt="spell" />
                        <div className={styles.nb}>
                            {participant[`spell${index + 1}Casts` as keyof typeof participant] as number}
                        </div>
                    </div>
                );
            })}
            <div className={cx(styles.container, css({ mt: "20px" }))}>
                <img className={styles.image} src={getSummonerSpellImage(participant.summoner1Id)} alt="spell" />
                <div className={styles.nb}>{nbSummSpell1}</div>
            </div>
            <div className={styles.container}>
                <img className={styles.image} src={getSummonerSpellImage(participant.summoner2Id)} alt="spell" />
                <div className={styles.nb}>{nbSummSpell2}</div>
            </div>
        </div>
    );
};
const spellStyles = sva({
    slots: ["root", "container", "image", "nb"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5px",
        },
        container: {
            display: "flex",
            alignItems: "center",
            gap: "15px",
        },
        image: {
            width: "40px",
            height: "40px",
        },
        nb: {
            fontSize: "20px",
            fontWeight: "bold",
        },
    },
});
