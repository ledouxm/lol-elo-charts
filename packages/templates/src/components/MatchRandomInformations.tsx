import { css, cx } from "../../styled-system/css";
import { sva } from "../../styled-system/css/sva";
import { Flex } from "../../styled-system/jsx";
import { Minions } from "./random-informations/Minions";
import { Objectives } from "./random-informations/Objectives";
import { Pings } from "./random-informations/Pings";
import { Skillshots } from "./random-informations/Skillshots";
import { Spells } from "./random-informations/Spells";
import { TimeSpentDead } from "./random-informations/TimeSpentDead";
import { Vision } from "./random-informations/Vision";
import { DefaultProps, setContext } from "./utils";
import { Chart, ArcElement } from "chart.js";

Chart.register(ArcElement);

export const MatchRandomInformations = (props: DefaultProps) => {
    setContext(props);

    const { participant, championFull } = props;
    const spells = championFull[participant.championName]?.spells;
    const styles = randomInformations({});

    return (
        <div className={styles.root}>
            <div className={styles.row}>
                <div className={styles.kpiContainer}>
                    <label>Objectives</label>
                    <div className="value">
                        <Objectives {...props} />
                    </div>
                </div>
                <div className={cx(styles.kpiContainer, css({ flex: "1" }))}>
                    <label>Time spent dead</label>
                    <div className="value">
                        <TimeSpentDead {...props} />
                    </div>
                </div>
                {spells ? (
                    <div className={styles.kpiContainer}>
                        <label>Spells</label>
                        <div className="value">
                            <Spells {...props} spells={spells} />
                        </div>
                    </div>
                ) : null}
            </div>
            <div className={styles.row}>
                <Flex flexDirection="column">
                    <div className={cx(styles.kpiContainer, css({ flex: "1" }))}>
                        <label>Skillshots</label>
                        <div className="value">
                            <Skillshots {...props} />
                        </div>
                    </div>
                    <div className={cx(styles.kpiContainer, css({ flex: "1" }))}>
                        <label>Minions</label>
                        <div className="value">
                            <Minions {...props} />
                        </div>
                    </div>
                </Flex>
                <div className={cx(styles.kpiContainer, css({ flex: 1 }))}>
                    <label>Vision</label>
                    <div className="value">
                        <Vision {...props} />
                    </div>
                </div>

                <div className={styles.kpiContainer}>
                    <label>Pings</label>
                    <div className={cx("value", css({ display: "flex", justifyContent: "center", w: "100%" }))}>
                        <Pings {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const randomInformations = sva({
    slots: ["root", "row", "kpiContainer"],
    base: {
        root: {
            display: "column",
            fontWeight: "light",
            color: "white",
        },
        row: {
            display: "flex",
            flexDirection: "row",
        },
        kpiContainer: {
            display: "flex",
            flexDirection: "column",
            p: "10px",
            pt: "5px",
            bgColor: "dark-gray",
            borderRadius: "10px",
            m: "5px",
            "& > label": {
                color: "white",
                fontSize: "20px",
                fontWeight: "semibold",
                textAlign: "left",
            },
            "& > .value": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                w: "100%",
                h: "100%",

                color: "white",
            },
        },
    },
});
