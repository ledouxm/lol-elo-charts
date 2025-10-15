import express from "express";
import cors from "cors";
import { db } from "@/db/db";
import { request } from "@/db/schema";
import { subMinutes } from "date-fns";
import { and, asc, gte, lte, sql } from "drizzle-orm";
import { makeDebug } from "@/utils";
import { ENV } from "@/envVars";
import { duoqRouter } from "./duoq";
import { liveRouter } from "./live";

const debug = makeDebug("router");

export const makeRouter = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.use("/api", router);
    app.use("/api", duoqRouter);
    app.use("/api", liveRouter);
    const port = ENV.HTTP_PORT;

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send("Something broke!");
    });
    app.listen(port, "0.0.0.0", () => {
        debug(`Listening on port ${port}`);
    });
};

const router = express.Router();
router.get("/requests", async (req, res) => {
    const { start, end } = req.query;
    const startD = start ? new Date(start as string) : subMinutes(new Date(), 60);
    const endD = end ? new Date(end as string) : null;

    const requests = await getRequestsBetween(startD, endD);
    res.json(requests);
});

export const getRequestsBetween = async (start: Date, end?: Date) => {
    const where = !end
        ? gte(request.createdAt, start)
        : and(gte(request.createdAt, start), lte(request.createdAt, end));

    const clampMinuteSqlQuery = sql`DATE_TRUNC('minute', ${request.createdAt})`.as("minutes");
    const clampSecondSqlQuery = sql`DATE_TRUNC('second', ${request.createdAt})`.as("seconds");

    const minutes = await db
        .select({ count: sql<number>`COUNT(*)`, date: clampMinuteSqlQuery })
        .from(request)
        .where(where)
        .orderBy(asc(clampMinuteSqlQuery))
        .groupBy(clampMinuteSqlQuery);

    const seconds = await db
        .select({ count: sql<number>`COUNT(*)`, date: clampSecondSqlQuery })
        .from(request)
        .where(where)
        .orderBy(asc(clampSecondSqlQuery))
        .groupBy(clampSecondSqlQuery);

    return { minutes, seconds };
};

export const clearRequests = async () => {
    return db.delete(request);
};
