import { css } from "../../../styled-system/css";
import { sva } from "../../../styled-system/css/sva";
import { Grid } from "../../../styled-system/jsx";
import { DefaultProps, pingImages, pingKeys } from "../utils";

export const Pings = ({ participant }: DefaultProps) => {
    const styles = pingContainer({});

    const nbPings = pingKeys.reduce((acc, key) => acc + (participant[key] as number), 0);

    const pingsWithImage = pingKeys
        .map((key) => {
            return {
                nb: participant[key] as number,
                image: pingImages[key],
            };
        })
        .sort((a, b) => b.nb - a.nb);

    return (
        <div className={styles.root}>
            <div className={styles.total}>
                <label>Total: </label>
                <div className={css({ fontWeight: "bold" })}>{nbPings}</div>
            </div>
            <Grid
                className={css({
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridAutoRows: "minmax(0, 1fr)",
                    columnGap: "45px",
                    rowGap: "0",
                    gridAutoFlow: "dense",
                })}
            >
                {pingsWithImage.map((ping, index) => {
                    return (
                        <div
                            key={index}
                            className={styles.container}
                            style={{ gridRowStart: "auto", gridColumnStart: index < 6 ? 1 : 2 }}
                        >
                            <img className={styles.image} src={ping.image} alt="ping" />
                            <div className={styles.nb}>{ping.nb}</div>
                        </div>
                    );
                })}
            </Grid>
        </div>
    );
};
const pingContainer = sva({
    slots: ["root", "container", "total", "image", "nb"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            px: "20px",
        },
        container: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
        },
        total: {
            display: "flex",
            alignItems: "center",
            mb: "15px",
            gap: "5px",
            fontSize: "20px",
            justifyContent: "center",
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
