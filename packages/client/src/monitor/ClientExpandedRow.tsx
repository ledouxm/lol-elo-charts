import { Box } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useAtomValue } from "jotai/utils";

import { presenceFamilyAtom } from "@/socket/usePresence";

import { JsonEditor } from "./JsonEditor";

export function ClientExpandedRow({ userId }) {
    const presence = useAtomValue(presenceFamilyAtom(userId));

    return (
        <Box>
            <Tabs>
                <TabList>
                    <Tab>State</Tab>
                    <Tab isDisabled={!Object.keys(presence.meta).length}>Meta</Tab>
                    <Tab>Rooms</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <JsonEditor value={presence.state} mode="view" />
                    </TabPanel>
                    <TabPanel>
                        <JsonEditor value={presence.meta} mode="view" />
                    </TabPanel>
                    <TabPanel>TODO</TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}
