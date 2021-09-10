import { useEffect } from "react";

import { useSocketClient } from "@/socket/useSocketClient";

import { GlobalClientsTable } from "./ClientsTable";

export const PresenceMonitor = () => {
    const client = useSocketClient();

    useEffect(() => {
        client.presence.list();
    }, []);

    return <GlobalClientsTable />;
};
