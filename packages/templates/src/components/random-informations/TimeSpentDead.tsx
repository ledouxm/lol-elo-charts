import { sva } from "../../../styled-system/css/sva";
import { styled } from "../../../styled-system/jsx";
import { DefaultProps } from "../utils";
import { Pie } from "./Pie";
// import { Pie } from "react-chartjs-2";

export const TimeSpentDead = ({ participant, match }: DefaultProps) => {
    const styles = timeSpentDeadStyles({});
    const timeSpentDeadPercentage = Math.round((participant.totalTimeSpentDead / match.info.gameDuration) * 100);

    return (
        <div className={styles.root}>
            <div className={styles.overlay}>
                <styled.span fontWeight="normal" fontSize="50px" mb="-20px">
                    {participant.totalTimeSpentDead}
                    <styled.span fontSize="40px"> sec</styled.span>
                </styled.span>
                {timeSpentDeadPercentage}%<br />
            </div>
            <Pie percentage={100 - timeSpentDeadPercentage} />
            {/* <Pie
                options={{
                    animation: false,
                }}
                data={{
                    labels: ["Alive", "Dead"],
                    datasets: [
                        {
                            data: [100 - timeSpentDeadPercentage, timeSpentDeadPercentage],
                            backgroundColor: [token("colors.gray"), token("colors.red")],
                            hoverBackgroundColor: [token("colors.blue"), token("colors.gray")],
                            borderColor: ["transparent", "transparent"],
                        },
                    ],
                }}
            /> */}
        </div>
    );
};

const timeSpentDeadStyles = sva({
    slots: ["root", "overlay", "value"],
    base: {
        root: {
            width: "300px",
            height: "300px",
            position: "relative",
        },
        overlay: {
            display: "flex",
            position: "absolute",
            flexDirection: "column",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            fontSize: "70px",
            color: "white",
            fontWeight: "bold",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3,
        },
        value: {},
    },
});
