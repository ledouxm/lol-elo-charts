import { DuoqForm } from "@/features/DuoqForm";
import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import "../App.css";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <Box width="850px">
            <DuoqForm />
        </Box>
    );
}
