import { useAtomValue } from "jotai/utils";
import { useEffect, useMemo } from "react";

import { DynamicTable, DynamicTableProps } from "@/components/DynamicTable";
import { presencesMapAtom } from "@/socket/usePresence";
import { UseRoomStateReturn } from "@/socket/useRoomState";
import { useSocketClient } from "@/socket/useSocketClient";
import { Presence } from "@/types";

import { ClientActionMenu } from "./ClientActionMenu";
import { ClientExpandedRow } from "./ClientExpandedRow";

export const RoomClientsTable = ({ room }: { room: UseRoomStateReturn }) => (
    <ClientsTable presenceList={room.presences} getCellProps={() => ({ room })} />
);
export const GlobalClientsTable = () => {
    const presenceMap = useAtomValue(presencesMapAtom);
    const presenceList = Object.values(presenceMap);

    return <ClientsTable presenceList={presenceList} />;
};

const ClientsTable = ({
    presenceList,
    ...tableProps
}: { presenceList: Array<Presence> } & Partial<Pick<DynamicTableProps, "getCellProps" | "getHeaderProps">>) => {
    const client = useSocketClient();
    const ids = useMemo(() => presenceList.map((presence) => presence.state?.id), [presenceList]);
    console.log(ids, presenceList);

    // On room.clients change, retrieve presence.meta so we can display client.meta.sessionid
    useEffect(() => {
        presenceList.forEach(({ state, meta }) => {
            if (!Object.keys(state).length) client.presence.get(state.id);
            if (!Object.keys(meta).length) client.presence.getMeta(state.id);
        });
    }, [ids]);

    return (
        <DynamicTable
            {...tableProps}
            columns={columns}
            data={presenceList}
            renderSubRow={({ row }) => <ClientExpandedRow userId={(row.original as any).state.id} />}
        />
    );
};

// TODO dynamic columns (= display columns for state.XXX.YYY or meta.ZZZ)
const columns = [
    { Header: "username", accessor: "state.username" },
    { Header: "id", accessor: "state.id" },
    { Header: "color", accessor: "state.color" },
    {
        Header: "",
        accessor: "__actions",
        canBeSorted: false,
        Cell: ({ row, room }) => <ClientActionMenu row={row} room={room} />,
    },
];
