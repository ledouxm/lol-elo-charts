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
        return this.on(evt, function wrappedCb(data: Data) {
            self.off(evt, wrappedCb);
            callback(data);
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
        const listeners: EventCallback[] = Array.from(this.listeners.get(evt) || new Set()).filter(Boolean) as any;
        listeners.forEach((cb) => cb(data));
    }
}

type EventCallback<Data = unknown> = (data: Data) => void;
