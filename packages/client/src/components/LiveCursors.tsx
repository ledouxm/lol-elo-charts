import { throttle } from "@/functions/utils";
import { useLocalPresence, useMyPresence, useOtherPresences, usePresenceList } from "@/hooks/usePresence";
import { useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { Player } from "@/types";
import { chakra, useEventListener } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

const emptyPositionTxt = "Move your cursor to broadcast its position to other people in the room.";
interface PlayerMeta extends Pick<Player, "id"> {
    [key: string]: any;
}

const getCursorFromEvent = (e) => ({ x: Math.round(e.clientX), y: Math.round(e.clientY) });

export function LiveCursors() {
    const [{ cursor }, setPresence] = useLocalPresence();
    const others = useOtherPresences();

    // Update the user cursor position on every pointer move
    useEventListener(
        "pointermove",
        throttle((e) => setPresence((current) => ({ ...current, cursor: getCursorFromEvent(e) })), 150)
    );
    useEventListener(
        "pointerleave",
        throttle(() => setPresence((current) => ({ ...current, cursor: null })), 150)
    );

    return (
        <chakra.div
            style={{
                position: "relative",
                height: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <chakra.div mt="auto" mb="20px">
                {cursor ? `${cursor.x},${cursor.y}` : emptyPositionTxt}
            </chakra.div>

            {others.map(({ id, cursor, color }) => {
                if (!cursor) return null;

                return <Cursor key={id} color={color} x={cursor.x} y={cursor.y} />;
            })}
        </chakra.div>
    );
}

function Cursor({ color, x, y }) {
    return (
        <chakra.svg
            css={{
                position: "absolute",
                left: 0,
                top: 0,
                transition: "transform 0.6s cubic-bezier(.17,.93,.38,1)",
            }}
            style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
            width="24px"
            height="36px"
            viewBox="0 0 24 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
            />
        </chakra.svg>
    );
}

export function LiveCursorsWithRefs() {
    const emit = useSocketEmit();

    // Emit local presence update on cursor position change
    const updateMyMeta = (cursor) => {
        positionTxtRef.current.textContent = cursor ? `${cursor.x},${cursor.y}` : emptyPositionTxt;
        emit("presence.update#meta", { cursor });
    };
    useEventListener(
        "pointermove",
        throttle((e) => updateMyMeta(getCursorFromEvent(e)), 150)
    );
    useEventListener(
        "pointerleave",
        throttle(() => updateMyMeta(null), 150)
    );

    const cursorsRef = useRef([] as Array<HTMLDivElement>);
    const setRef = (node, index) => (cursorsRef.current[index] = node);

    /** On others presence meta update, set their cursor positions accordingly */
    useSocketEvent<Array<PlayerMeta>>("presence/list#meta", (updated) => {
        updated.forEach((updatedMeta, index) => {
            if (!cursorsRef.current[index] || !updatedMeta.cursor) return;

            const { x, y } = updatedMeta.cursor;
            cursorsRef.current[index].style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });

    // Set initial text on mount
    const positionTxtRef = useRef<HTMLDivElement>();
    useEffect(() => {
        positionTxtRef.current.textContent = emptyPositionTxt;
    }, []);

    // Will trigger a re-render on presence list update,
    // e.g when someone arrives/exits or update its username/color
    const presenceList = usePresenceList();
    const me = useMyPresence();

    return (
        <chakra.div
            css={{
                position: "fixed",
                height: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
            }}
        >
            <chakra.div mt="auto" mb="20px" ref={positionTxtRef} />
            {presenceList.map(({ id, color }, index) =>
                me.id == id ? null : <CursorWithRef key={id} color={color} index={index} setRef={setRef} />
            )}
        </chakra.div>
    );
}

function CursorWithRef({ color, index, setRef }) {
    return (
        <chakra.svg
            ref={(node) => setRef(node, index)}
            css={{
                position: "absolute",
                left: 0,
                top: 0,
                transition: "transform 0.6s cubic-bezier(.17,.93,.38,1)",
            }}
            width="24px"
            height="36px"
            viewBox="0 0 24 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
            />
        </chakra.svg>
    );
}
