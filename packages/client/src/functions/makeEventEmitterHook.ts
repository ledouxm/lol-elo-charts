import { useIsMountedRef } from "@pastable/core";
import { Atom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useEffect, useRef } from "react";

import { EventCallback, EventEmitter } from "@/functions/EventEmitter";

/** Returns a hook that will de-duplicate event listeners using the instance of EventEmitter retrieved from the passed atom */
export function makeEventEmitterHook(emitterAtom: Atom<EventEmitter>) {
    return function <Data = unknown, Event = unknown>(event: Event, callback: EventCallback<Data>, isOnce?: boolean) {
        const emitter = useAtomValue(emitterAtom);
        const callbackRef = useRef<typeof callback>();

        const isMountedRef = useIsMountedRef();
        const safeCallbackRef = useRef(function () {
            if (!isMountedRef.current) return;
            callbackRef.current!.apply(null, arguments as any);
        });
        const offRef = useRef<Function>();

        useEffect(() => {
            const isEqual = callback === callbackRef.current;
            if (!isEqual) {
                offRef.current?.();
                callbackRef.current = callback;

                if (callbackRef.current!) {
                    offRef.current = emitter[isOnce ? "once" : "on"](event, safeCallbackRef.current);
                }
            }

            return () => offRef.current?.();
        }, [emitter, callback]);
    };
}
