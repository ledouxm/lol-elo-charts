import { getSaturedColor, isColorDark } from "@/functions/utils";
import { usePresenceList, useMyPresence } from "@/socket/usePresence";
import { Player } from "@/types";
import {
    Box,
    BoxProps,
    Center,
    chakra,
    CloseButton,
    Stack,
    Tooltip,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { atomWithToggleAndStorage, WithChildren } from "@pastable/core";
import { useAtomValue } from "jotai/utils";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { IconAction } from "./IconAction";

export const isPlayerListShownAtom = atomWithToggleAndStorage("platformer/isPlayerListShown");
export const PlayerList = ({ list, withToggle = true }: { list: Array<Player>; withToggle?: boolean }) => {
    const toggle = useDisclosure({ defaultIsOpen: true });

    return (
        <Box pos="fixed" top="100px" right="0">
            {withToggle && toggle.isOpen && <CloseButton ml="auto" size="sm" onClick={toggle.onClose} />}
            {!toggle.isOpen && (
                <IconAction icon={AiOutlineUnorderedList} label="Open PlayerList" onClick={toggle.onOpen} ml="auto" />
            )}
            <Stack alignItems="flex-end" display={toggle.isOpen ? "" : "none"}>
                {!list.length && (
                    <ColoredTag sideColor="#bcd0ea80" color="#c8d6e5">
                        There is no-one here
                    </ColoredTag>
                )}
                {list.map((player) => (
                    <PlayerName key={player.id} player={player} />
                ))}
            </Stack>
        </Box>
    );
};

const PlayerName = ({ player }: { player: Player }) => {
    const me = useMyPresence();

    return (
        <ColoredTag
            color={player.color}
            sideColor={getSaturedColor(player.color)}
            sideWidth={me.id === player.id ? "30px" : "20px"}
        >
            <Tooltip label={<chakra.span fontSize="xx-small">({player.id})</chakra.span>}>
                <chakra.span fontWeight="bold">{player.username}</chakra.span>
            </Tooltip>
        </ColoredTag>
    );
};

const ColoredTag = ({
    children,
    color,
    sideColor,
    sideWidth = "20px",
}: WithChildren & { color: string; sideColor: string; sideWidth?: BoxProps["w"] }) => {
    const fontColor = isColorDark(color.length > 7 ? color.slice(0, -2) : color) ? "white" : "black";

    return (
        <Box py="2" px="4" w="250px" bgColor={color} pos="relative" color={fontColor}>
            <Center pos="absolute" top="0" right="100%" h="100%" w={sideWidth} bgColor={sideColor}></Center>
            {children}
        </Box>
    );
};

export const PresenceList = () => {
    const presenceList = usePresenceList();
    const isPlayerListShown = useAtomValue(isPlayerListShownAtom);

    return (
        <div style={{ display: isPlayerListShown ? "" : "none" }}>
            <PlayerList list={presenceList} withToggle={false} />
        </div>
    );
};
