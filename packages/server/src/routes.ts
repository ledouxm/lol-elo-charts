import { getRandomIntIn } from "@pastable/core";
import { FastifyPluginCallback } from "fastify";
import { getUserByNameAndPassword, makeAccessToken, makeGuestAccessToken, persistUser } from "./auth";
import { getEm } from "./db";
import { formatUser, User } from "./entities/User";
import { handleRequest } from "./requests";

export const routes: FastifyPluginCallback = (app, _options, done) => {
    app.get("/", async () => ({ hello: "world" }));
    app.get("/status", async () => "ok");

    app.post(
        "/auth/register",
        handleRequest(async ({ name, password }: { name: string; password?: string }) => {
            if (!name || !password) return { isValid: false, error: "Missing name or pw" };
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

    done();
};
