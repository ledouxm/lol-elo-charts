import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Box } from "@mui/material";

export const Route = createRootRoute({
    component: () => (
        <>
            <Box
                bgcolor="background.dark"
                display="flex"
                flexDirection="column"
                alignItems="center"
                // justifyContent="center"
                height="100vh"
                width="100vw"
                overflow="auto"
                sx={{
                    scrollbarGutter: "stable",
                }}
            >
                <Outlet />
            </Box>
            <TanStackDevtools
                config={{
                    position: "bottom-right",
                }}
                plugins={[
                    {
                        name: "Tanstack Router",
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                ]}
            />
        </>
    ),
});
