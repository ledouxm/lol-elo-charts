import { Router } from "express";

export const router: Router = Router();
router.get("/", async (_, res) => res.send({ hello: "world" }));
