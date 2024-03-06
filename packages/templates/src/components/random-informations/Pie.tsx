import { css, cva } from "../../../styled-system/css";

export const Pie = ({ percentage }: { percentage: number }) => {
    return (
        <div className={pie({})}>
            <div
                className={css({
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "50%",
                    bg: "red",
                    zIndex: 1,
                })}
            ></div>
            <div
                className={pie()}
                style={{ background: `conic-gradient(#787878 calc(${percentage}*1%),#0000 0)` }}
            ></div>
        </div>
    );
};

const pie = cva({
    base: {
        width: "300px",
        aspectRatio: 1,
        display: "inline-grid",
        placeContent: "center",
        borderRadius: "50%",
        position: "relative",
        zIndex: 2,
    },
});
