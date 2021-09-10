import { getRandomIntIn } from "@pastable/core";
import { FastifyPluginCallback } from "fastify";

import { getUserByNameAndPassword, makeAccessToken, makeGuestAccessToken, persistUser } from "./auth";
import { getEm } from "./db";
import { User, UserRole, formatUser } from "./entities/User";
import { HTTPError, handleAuthenticatedRequest, handleRequest } from "./requests";

export const routes: FastifyPluginCallback = (app, _options, done) => {
    app.get("/", async () => ({ hello: "world" }));
    app.get("/status", async () => "ok");

    app.post(
        "/auth/register",
        handleRequest(async ({ name, password }: { name: string; password?: string }) => {
            if (!name || !password) throw new HTTPError("Missing name or pw", 400);
            const user = await persistUser(name, password);
            const token = makeAccessToken(user);
            return { ...formatUser(user), token };
        })
    );

    app.post("/auth/login", async (req, res) => {
        const { name, password } = req.body as { name: string; password?: string };
        if (password) {
            const user = await getUserByNameAndPassword(name, password);
            if (!user) {
                return res.status(404).send({ error: "Not found" });
            }

            const token = makeAccessToken(user);
            return { ...formatUser(user), token };
        }

        const em = getEm();
        const token = makeGuestAccessToken(name);
        const existingUser = await em.findOne(User, { username: name });
        if (existingUser) {
            return { username: name + "-" + getRandomIntIn(0, 100), token };
        }

        return { username: name, token };
    });

    app.post(
        "/roles/add",
        handleAuthenticatedRequest<{ roles: Array<UserRole> }>(async ({ user, roles }) => {
            if (!roles) throw new HTTPError("Missing roles argument");
            if (!Array.isArray(roles)) throw new HTTPError("Roles should be an array");
            if (!roles.length) throw new HTTPError("Roles should not be empty");

            user.roles.push(...roles);
            const em = getEm();
            em.persistAndFlush(user);
            return { ...formatUser(user) };
        })
    );
    app.post(
        "/roles/delete",
        handleAuthenticatedRequest<{ roles: Array<UserRole> }>(async ({ user, roles }) => {
            if (!roles) throw new HTTPError("Missing roles argument");
            if (!Array.isArray(roles)) throw new HTTPError("Roles should be an array");
            if (!roles.length) throw new HTTPError("Roles should not be empty");

            user.roles = user.roles.filter((role) => roles.includes(role));
            const em = getEm();
            em.persistAndFlush(user);
            return { ...formatUser(user) };
        })
    );

    done();
};
