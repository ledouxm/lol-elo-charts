import { css, sva } from "../../styled-system/css";

export const GRID = "48px minmax(0, 1fr) 96px 60px 54px 44px";

export const container = css({
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    w: "700px",
    p: "18px",
    fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif",
    color: "#ece8e1",
    background: "linear-gradient(160deg, #10202b 0%, #0b141c 100%)",
    borderRadius: "16px",
    border: "1px solid #22303c",
});

export const header = {
    wrap: css({
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        h: "96px",
        px: "18px",
        pb: "12px",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#0b141c",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
    }),
    meta: css({
        display: "flex",
        flexDirection: "column",
        lineHeight: "1.05",
    }),
    map: css({
        fontSize: "34px",
        fontWeight: "700",
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "#ffffff",
        textShadow: "0 2px 10px rgba(0,0,0,0.6)",
    }),
    mode: css({
        fontSize: "13px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#9aa6b0",
    }),
    score: css({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "44px",
        fontWeight: "800",
        fontVariantNumeric: "tabular-nums",
        textShadow: "0 2px 10px rgba(0,0,0,0.6)",
    }),
    colon: css({ color: "#8b98a5", fontWeight: "400" }),
};

export const teamBlock = css({
    display: "flex",
    flexDirection: "column",
    gap: "3px",
});

export const teamHeader = {
    wrap: css({
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        h: "34px",
        pl: "16px",
        mb: "3px",
        borderBottom: "1px solid",
        background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0))",
    }),
    stripe: css({
        position: "absolute",
        left: "0",
        top: "0",
        bottom: "0",
        w: "4px",
        borderRadius: "2px",
    }),
    result: css({
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "2px",
        textTransform: "uppercase",
    }),
    record: css({
        fontSize: "20px",
        fontWeight: "800",
        fontVariantNumeric: "tabular-nums",
    }),
};

export const colHead = {
    wrap: css({
        display: "grid",
        alignItems: "center",
        gap: "10px",
        px: "10px",
        pb: "2px",
    }),
    label: css({
        fontSize: "11px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "#67737e",
    }),
    stat: css({
        fontSize: "11px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "#67737e",
        textAlign: "center",
    }),
};

export const playerRow = sva({
    slots: [
        "row",
        "agent",
        "identity",
        "nameRow",
        "name",
        "tag",
        "rankRow",
        "rank",
        "tier",
        "statCell",
        "kda",
        "kills",
        "deaths",
        "assists",
        "slash",
        "statValue",
    ],
    base: {
        row: {
            display: "grid",
            alignItems: "center",
            gap: "10px",
            h: "56px",
            px: "10px",
            borderRadius: "8px",
            borderLeft: "3px solid transparent",
            background: "rgba(255,255,255,0.03)",
        },
        agent: {
            w: "44px",
            h: "44px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
        },
        identity: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "3px",
            minW: "0",
        },
        nameRow: {
            display: "flex",
            alignItems: "baseline",
            gap: "5px",
            minW: "0",
        },
        name: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#ffffff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxW: "170px",
        },
        tag: {
            fontSize: "12px",
            color: "#67737e",
            whiteSpace: "nowrap",
        },
        rankRow: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
        },
        rank: {
            w: "20px",
            h: "20px",
        },
        tier: {
            fontSize: "12px",
            letterSpacing: "0.5px",
            color: "#9aa6b0",
            whiteSpace: "nowrap",
        },
        statCell: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        kda: {
            display: "flex",
            alignItems: "baseline",
            gap: "3px",
            fontSize: "17px",
            fontWeight: "600",
            fontVariantNumeric: "tabular-nums",
        },
        kills: { color: "#ece8e1" },
        deaths: { color: "#8b98a5" },
        assists: { color: "#ece8e1" },
        slash: { color: "#4a565f", fontSize: "13px" },
        statValue: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#ece8e1",
            fontVariantNumeric: "tabular-nums",
        },
    },
    variants: {
        isPlayer: {
            true: {
                row: {
                    background: "linear-gradient(90deg, rgba(245,194,107,0.16), rgba(245,194,107,0.03))",
                    boxShadow: "inset 0 0 0 1px rgba(245,194,107,0.35)",
                },
            },
        },
    },
});
