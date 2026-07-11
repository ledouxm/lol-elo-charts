import { ReactNode } from "react";

const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
} as const;

const shapes: Record<string, ReactNode> = {
    // crosshair
    Eliminated: (
        <>
            <circle cx="12" cy="12" r="6" {...stroke} />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...stroke} />
        </>
    ),
    // shield
    "Bomb defused": <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zM9 12l2 2 4-4" {...stroke} />,
    // spike burst
    "Bomb detonated": (
        <path
            d="M12 2l2.2 5.1L20 6l-2.8 4.6L22 13l-5.6 1 1 5.6-4.4-3.4L8.6 20l1-5.6L4 13l4.8-2.4L6 6l5.8 1.1L12 2z"
            fill="currentColor"
        />
    ),
};

export const RoundEndIcon = ({ type, size = 22 }: { type: string; size?: number }) =>
    shapes[type] ? (
        <svg width={size} height={size} viewBox="0 0 24 24">
            {shapes[type]}
        </svg>
    ) : null;
