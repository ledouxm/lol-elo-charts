import { css, sva } from "../../styled-system/css";

export const container = css({
    display: "inline-flex",
    flexDirection: "column",
    gap: "10px",
    p: "16px",
    fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif",
    background: "linear-gradient(160deg, #10202b 0%, #0b141c 100%)",
    borderRadius: "14px",
    border: "1px solid #22303c",
});

export const track = css({ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" });

export const header = {
    wrap: css({
        display: "flex",
        alignItems: "center",
        gap: "14px",
        px: "2px",
    }),
    title: css({
        fontSize: "15px",
        fontWeight: "700",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#8b98a5",
    }),
    score: css({
        display: "flex",
        alignItems: "baseline",
        gap: "6px",
        fontSize: "18px",
        fontWeight: "800",
        fontVariantNumeric: "tabular-nums",
    }),
    sep: css({ color: "#54626e" }),
};

export const divider = {
    wrap: css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        h: "60px",
        mx: "4px",
    }),
    line: css({
        w: "1px",
        flex: "1",
        background: "linear-gradient(#2f3b47, rgba(47,59,71,0.1))",
    }),
    label: css({
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1px",
        color: "#67737e",
    }),
};

export const roundBox = sva({
    slots: ["round", "number", "icon"],
    base: {
        round: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            w: "58px",
            h: "60px",
            borderRadius: "8px",
            borderBottom: "3px solid",
            color: "#ffffff",
            fontWeight: "700",
        },
        number: {
            fontSize: "15px",
            fontWeight: "700",
            color: "#ced6dd",
            fontVariantNumeric: "tabular-nums",
        },
        icon: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
    },
    variants: {
        playerWon: {
            true: {
                round: {
                    background: "linear-gradient(180deg, rgba(58,214,160,0.22), rgba(58,214,160,0.06))",
                    boxShadow: "inset 0 0 0 1px rgba(58,214,160,0.25)",
                },
            },
            false: {
                round: {
                    background: "linear-gradient(180deg, rgba(255,70,85,0.22), rgba(255,70,85,0.06))",
                    boxShadow: "inset 0 0 0 1px rgba(255,70,85,0.25)",
                },
            },
        },
    },
});
