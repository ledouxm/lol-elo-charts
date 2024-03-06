import { defineConfig } from "@pandacss/dev";
export default defineConfig({
    // Whether to use css reset
    preflight: true,

    // Where to look for your css declarations
    include: ["./src/**/*.{js,jsx,ts,tsx}"],
    outExtension: "js",
    // Files to exclude
    exclude: [],
    jsxFramework: "react",

    // Useful for theme customization
    theme: {
        extend: {
            tokens: {
                colors: {
                    red: { value: "#ff5859" },
                    blue: { value: "#2AA3CC" },
                    green: { value: "#2DEB90" },
                    yellow: { value: "#FDB05F" },
                    gray: { value: "#787878" },
                    "dark-gray": { value: "#2B2B2B" },
                    "light-gray": { value: "#9A9A9A" },
                },
            },
        },
    },
    globalCss: {
        "#root": {
            w: "100%",
            h: "100%",
            margin: "0 !important",
            padding: "0 !important",
            maxWidth: "initial !important",
            textAlign: "left",
        },
        body: {
            placeItems: "initial !important",
            bgColor: "black",
            color: "white",
        },
    },

    // The output directory for your css system
    outdir: "styled-system",
    plugins: [],
});
