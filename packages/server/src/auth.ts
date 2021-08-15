import WebSocket from "ws";
import http from "http";
import { wait } from "@pastable/core";
import { makeUrl } from "./helpers";

const pw = "chainbreak";
export const isAuthValid = async (ws: WebSocket, req: http.IncomingMessage) => {
    const url = makeUrl(req);
    const auth = url.searchParams.get("auth");
    if (auth !== pw) {
        // cheap rate-limiting
        await wait(2000);
        ws.close();
        return false;
    }

    return true;
};
