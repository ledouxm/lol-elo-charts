export class EventEmitter {
    withDebug = false;
    private debug(...args) {
        this.withDebug && console.log("[EventEmitter]", ...args);
    }
    private listeners = new Map<string, Set<EventCallback>>();
    private namedListeners = new Map<string, Map<string, EventCallback>>();

    on<Data = unknown, Event = unknown>(event: Event, callback: (data: Data) => void, name?: string) {
        this.debug("on", event);
        const evt = event as unknown as string;

        if (name) {
            if (!this.namedListeners.has(evt)) this.namedListeners.set(evt, new Map());
            if (!this.namedListeners.get(evt).has(name)) {
                this.namedListeners.get(evt).set(name, callback);
            }
            return;
        }

        if (!this.listeners.has(evt)) this.listeners.set(evt, new Set());
        this.listeners.get(evt).add(callback as any);

        return () => this.off(event, callback, name);
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

    off<Data = unknown, Event = unknown>(event: Event, callback?: (data: Data) => void, name?: string) {
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
        this.namedListeners.clear();
    }

    /** Dispatch event to listeners & execute each callback */
    dispatch<Event = unknown, Data = unknown>(event: Event, data: Data) {
        const evt = event as unknown as string;

        const listeners: EventCallback[] = Array.from(this.listeners.get(evt) || new Set());
        listeners.forEach((cb) => cb(data, evt));

        const namedListeners: EventCallback[] = Array.from(
            (this.namedListeners.get(evt) || new Map()).values() || new Set()
        );
        namedListeners.forEach((cb) => cb(data, evt));

        const namedEntries = Array.from(this.namedListeners.entries()).map(([key, map]) => [
            key,
            Array.from(map.values()),
        ]) as Array<[string, Array<EventCallback>]>;

        // Call wildcards listeners
        // ex: event = "rooms/*", will be called if event is "rooms/join" or "rooms/create", etc
        // ex: "*/update", "rooms/update:votes.*#*"", "rooms/*", "rooms/join"
        Array.from(this.listeners.entries())
            .concat(namedEntries as any)
            .filter(([key]) => key !== evt && wildcardToRegExp(key).test(evt))
            .forEach(([key, handlers]) => {
                const cbs = Array.from(handlers).filter(Boolean);
                cbs.forEach((cb) => cb(data, evt, ...(evt.match(wildcardToRegExp(key)) || []).slice(1)));
            });
    }
}

export type EventCallback<Data = unknown> = (data: Data, event: string, ...wildcardParams: string[]) => void;

// key.endsWith("*") && evt.startsWith(key.replace("*", ""))

// https://gist.github.com/donmccurdy/6d073ce2c6f3951312dfa45da14a420f
const wildcardToRegExp = (s) => new RegExp("^" + s.split(/\*+/).map(regExpEscape).join("(.*)") + "$");

/* RegExp-escapes all characters in the given string. */
const regExpEscape = (s) => s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
