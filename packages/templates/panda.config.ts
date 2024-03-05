import { defineConfig } from "@pandacss/dev";
import {  } from '@pandabox/panda-plugins'
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
                },
            },
        },
    },
    globalCss: {
        "#root": {
            w: "100%",
            h: "100%",
            margin: 0,
            padding: "0 !important",
            textAlign: "left",
        },
        body: {
            placeItems: "initial !important",
            bgColor: "black",
        },
    },

    // The output directory for your css system
    outdir: "styled-system",
    plugins: [
        
    ]
});
