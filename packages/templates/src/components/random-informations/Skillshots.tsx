import { sva } from "../../../styled-system/css/sva";
import { DefaultProps } from "../utils";

// TODO: Vision score, ranking on random stats
export const Skillshots = ({ participant }: DefaultProps) => {
    const styles = skillshotsStyles({});
    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <label className={styles.label}>Hit</label>
                <div className={styles.value}>{participant.challenges.skillshotsHit}</div>
            </div>
            <div className={styles.container}>
                <label className={styles.label}>Dodged</label>
                <div className={styles.value}>{participant.challenges.skillshotsDodged}</div>
            </div>
        </div>
    );
};
const skillshotsStyles = sva({
    slots: ["root", "container", "label", "value"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            p: "5px",
            w: "100%",
        },
        container: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "15px",
        },
        label: {
            // fontSize: "20px",
        },
        value: {
            fontSize: "20px",
            fontWeight: "bold",
        },
    },
});
