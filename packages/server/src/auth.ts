import { getRandomString, wait } from "@pastable/core";
import { createHash } from "crypto";
import http from "http";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { getEm } from "./db";
import { User } from "./entities/User";
import { makeUrl } from "./helpers";
import { HTTPError } from "./requests";

/** Authorize WS connection only if access token is valid */
export const getWsAuthState = async (ws: WebSocket, req: http.IncomingMessage) => {
    const url = makeUrl(req);
    const name = url.searchParams.get("username");
    const token = url.searchParams.get("token");

    try {
        if (token) {
            const decoded = getDecodedAccessToken(token);

            if (decoded.type === "guest") {
                return { isValid: true, id: "g-" + getRandomString(), name };
            }

            const em = getEm();
            const user = await em.findOne(User, { id: decoded.id });
            if (user) {
                return { isValid: true, user, name };
            }
        }
    } catch (error) {
        // cheap rate-limiting
        await wait(2000);
        ws.close();
        return { isValid: false };
    }

    // cheap rate-limiting
    await wait(2000);
    ws.close();
    return { isValid: false };
};

export const getUserByNameAndPassword = async (name: User["username"], password: string) => {
    const em = getEm();
    const user = await em.findOne(User, { username: name });
    if (!user) return;

    const computedHash = computeHash(user.username, password);
    if (user.hash === computedHash) return user;
};

export const persistUser = async (name: User["username"], password: string) => {
    const em = getEm();
    const existingUser = await em.findOne(User, { username: name });
    if (existingUser) {
        throw new HTTPError("Nom d'utilisateur déjà pris", 404);
    }

    const user = em.create(User, { username: name, hash: computeHash(name, password) });
    em.persist(user);
    await em.flush();

    return user;
};

export const makeAccessToken = (user: User) =>
    jwt.sign({ type: "user", id: user.id, name: user.username }, getJwtSecret());
export const makeGuestAccessToken = (name: string) => jwt.sign({ type: "guest", name }, getJwtSecret());
export const getDecodedAccessToken = (token: string) => jwt.verify(token, getJwtSecret()) as DecodedToken;

interface DecodedToken {
    id?: string;
    type: "user" | "guest";
    name: string;
}

const getJwtSecret = () => process.env.JWT_SECRET!;
const computeHash = (name: User["username"], password: string) =>
    createHash("sha1").update(`MiMoDie${name}LA${password}S4L0P3`).digest("hex");
