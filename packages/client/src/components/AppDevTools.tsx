import { DotsIconAction, IconAction } from "@/components/IconAction";
import { getRandomColor } from "@/functions/utils";
import { useUpdatePresence } from "@/hooks/usePresence";
import { Box, Menu, MenuButton, MenuItem, MenuList, Stack, StackProps, useColorMode } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { FiMonitor } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { Route, Switch, useHistory } from "react-router-dom";
import { isPlayerListShownAtom } from "./PlayerList";
import { PresenceName } from "./PresenceName";

export const AppDevTools = (props: StackProps) => {
    const history = useHistory();

    const setPresence = useUpdatePresence();
    const updateRandomColor = () => setPresence((player) => ({ ...player, color: getRandomColor() }));
    const { colorMode, toggleColorMode } = useColorMode();
    const [_isPlayerListShown, togglePlayerList] = useAtom(isPlayerListShownAtom);

    return (
        <Stack position="fixed" bottom="30" right="30" {...props}>
            <Stack direction="row">
                <Switch>
                    <Route
                        path="/app/monitor"
                        exact
                        children={
                            <IconAction
                                icon={IoGameControllerOutline}
                                label="App"
                                onClick={() => history.push("/app")}
                            />
                        }
                    />
                    <Route
                        path="/app"
                        children={
                            <IconAction icon={FiMonitor} label="Monitor" onClick={() => history.push("/app/monitor")} />
                        }
                    />
                </Switch>
                <Menu>
                    <MenuButton as={DotsIconAction} />
                    <MenuList>
                        <Box pl="15px">
                            <PresenceName />
                        </Box>
                        <MenuItem onClick={toggleColorMode}>Toggle {colorMode} mode</MenuItem>
                        <MenuItem onClick={() => togglePlayerList()}>Toggle player list</MenuItem>
                        <MenuItem onClick={updateRandomColor}>Set random presence.color</MenuItem>
                    </MenuList>
                </Menu>
            </Stack>
        </Stack>
    );
};
