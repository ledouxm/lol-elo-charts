import { Box, BoxProps, Button, Switch } from "@chakra-ui/react";
import { SetState } from "@pastable/core";
import { ChangeEvent, ReactNode, useState } from "react";

export const Debug = ({
    data,
    renderData,
    renderToggle,
    withToggle,
    initialState = true,
    boxProps,
    label = "Toggle debug",
}: DebugProps) => {
    const [isOpen, setOpen] = useState(initialState);

    return (
        <>
            {withToggle ? (
                <Button size="xs" onClick={() => setOpen((current) => !current)}>
                    {label}
                </Button>
            ) : (
                renderToggle?.({ defaultChecked: initialState, setOpen })
            )}
            {isOpen && (
                <Box
                    overflow="auto"
                    p="5px"
                    borderWidth="1px"
                    fontSize="0.8rem"
                    maxW="100%"
                    maxHeight="300px"
                    {...boxProps}
                >
                    {renderData ? (
                        renderData()
                    ) : (
                        <pre>{typeof data === "string" ? data : JSON.stringify(data, null, 2)}</pre>
                    )}
                </Box>
            )}
        </>
    );
};

export const DebugSwitch = ({ defaultChecked, setOpen }: DebugRenderToggleProps) => (
    <Switch
        defaultChecked={defaultChecked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setOpen(e.currentTarget.checked)}
    />
);

export type DebugProps = {
    data?: any;
    renderData?: () => ReactNode;
    renderToggle?: (props: DebugRenderToggleProps) => ReactNode;
    withToggle?: boolean;
    label?: string;
    initialState?: boolean;
    boxProps?: BoxProps;
};
export type DebugRenderToggleProps = { defaultChecked: boolean; setOpen: SetState<boolean> };
