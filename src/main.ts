import dotenv from "dotenv";
dotenv.config();
import { makeApp } from "./app";
const port = Number(process.env.HTTP_PORT) || 1337;

const start = async () => {
    try {
        const app = await makeApp();
        app.listen(port, () => {
            console.log(`server listening on port ${port}`);
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
