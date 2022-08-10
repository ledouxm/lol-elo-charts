import { Router } from "express";
import { handleRequest } from "./httpUtils/requests";

export const router: Router = Router();
router.get(
    "/",
    handleRequest(() => ({ hello: "world" }))
);
