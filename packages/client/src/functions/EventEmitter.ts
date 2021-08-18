export class EventEmitter {
    withDebug = false;
    private debug(...args) {
        this.withDebug && console.log("[EventEmitter]", ...args);
    }
    private listeners = new Map<string, Set<EventCallback>>();

    on<Data = unknown, Event = unknown>(event: Event, callback: (data: Data) => void) {
        this.debug("on", event);
        const evt = event as unknown as string;
        this.listeners.set(evt, (this.listeners.get(evt) || new Set()).add(callback as any));

        return () => this.off(event, callback);
    }

    once<Data = unknown, Event = unknown>(event: Event, callback: (data: Data) => void) {
        this.debug("once", event);
        const evt = event as unknown as string;
        const self = this;
        return this.on(evt, function wrappedCb(data: Data, ...args) {
            self.off(evt, wrappedCb);
            callback(data, ...args);
        });
    }

    off<Data = unknown, Event = unknown>(event: Event, callback?: (data: Data) => void) {
        this.debug("off", event);
        const evt = event as unknown as string;

        // Precisely remove a listener on an event
        if (callback) {
            const cbs = this.listeners.get(evt) || new Set();
            cbs.delete(callback as any);
            this.listeners.set(evt, cbs);
            return;
        }

        // Or just remove all of them
        this.listeners.delete(evt);
    }

    removeAllListeners() {
        this.debug("removeAllListeners");
        this.listeners.clear();
    }

    /** Dispatch event to listeners & execute each callback */
    dispatch<Event = unknown, Data = unknown>(event: Event, data: Data) {
        const evt = event as unknown as string;

        const listeners: EventCallback[] = Array.from(this.listeners.get(evt) || new Set());
        listeners.forEach((cb) => cb(data, evt));

        // Call wildcards listeners
        // ex: event = "rooms/*", will be called if event is "rooms/join" or "rooms/create", etc
        // ex: "*/update", "rooms/update:votes.*#*"", "rooms/*", "rooms/join"
        Array.from(this.listeners.entries())
            .filter(([key]) => key !== evt && wildcardToRegExp(key).test(evt))
            .forEach(([key, listeners]) => {
                const cbs = Array.from(listeners).filter(Boolean);
                cbs.forEach((cb) => cb(data, evt, ...(evt.match(wildcardToRegExp(key)) || []).slice(1)));
            });
    }
}

export type EventCallback<Data = unknown> = (data: Data, event: string, wildcard?: string) => void;

// key.endsWith("*") && evt.startsWith(key.replace("*", ""))

// https://gist.github.com/donmccurdy/6d073ce2c6f3951312dfa45da14a420f
const wildcardToRegExp = (s) => new RegExp("^" + s.split(/\*+/).map(regExpEscape).join("(.*)") + "$");

/* RegExp-escapes all characters in the given string. */
const regExpEscape = (s) => s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
