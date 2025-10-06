import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["src/main.tsx"],
    format: ["esm"],
    noExternal: ["@lol-elo-charts/templates", "@lol-elo-charts/shared"],
});
