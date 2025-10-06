import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            dark: "oklch(.1 0 0)",
            default: "oklch(.15 0 0)",
            light: "oklch(.20 0 0)",
            lighter: "oklch(.25 0 0)",
        },
        win: { default: "#3044c9", dark: "#0e143c" },
        loss: { default: "#f7665e", dark: "#4a1f1c" },
    },
    shadows: [
        "none",

        `inset 0 1px 2px #ffffff30,
        0 1px 2px #00000030,
        0 2px 4px #00000015`,

        `inset 0 1px 2px #ffffff50,
        0 2px 4px #00000030,    
        0 4px 8px #00000015`,

        `inset 0 1px 2px #ffffff70,
        0 4px 6px #00000030,    
        0 6px 10px #00000015`,

        `inset 0 2px 8px #00000090,
        inset 0 -2px 4px #ffffff05`,
    ],
    typography: {
        fontFamily: "'Montserrat', sans-serif",
    },
});

const queryClient = new QueryClient();

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <ThemeProvider theme={darkTheme}>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </ThemeProvider>
        </StrictMode>
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
