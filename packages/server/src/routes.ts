import { FastifyPluginCallback } from "fastify";


export const routes: FastifyPluginCallback = (app, _options, done) => {
    app.get("/", async () => ({ hello: "world" }));
    app.get("/status", async () => "ok");


    done();
};
