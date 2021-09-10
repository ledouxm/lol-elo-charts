import { Box, Center, SimpleGrid, Stack, chakra } from "@chakra-ui/react";
import { sortArrayOfObjectByPropFromArray } from "@pastable/core";
import { useContext } from "react";

import { sliceColor } from "@/platformer/features/character/Character";

import { RoomContext } from "./LobbyRoom";

const gamesList = [
    {
        id: "Platformer",
        image: "/assets/games/platformer.png",
    },
    {
        id: "TicTacToe",
        image: "/assets/games/morpion.png",
    },
];

export type Game = typeof gamesList[0];

export const GameList = ({ onClick }: { onClick?: (gameId: string) => void }) => {
    return (
        <Stack>
            <chakra.h2 fontWeight="bold" fontSize="30px">
                Games
            </chakra.h2>
            <SimpleGrid
                justifyContent={gamesList.length > 5 ? "center" : "initial"}
                templateColumns="repeat(auto-fit, minmax(300px, 0fr))"
                spacing="5px"
            >
                {gamesList.map((game) => (
                    <GameItem key={game.id} game={game} onClick={onClick} />
                ))}
            </SimpleGrid>
        </Stack>
    );
};

const GameItem = ({ game, onClick }: { game: Game; onClick?: (gameId: string) => void }) => {
    const { votes, history, selected } = useContext(RoomContext);

    const myVotes = votes.filter((vote) => vote.gameId === game.id);
    const sorted = sortArrayOfObjectByPropFromArray(
        myVotes,
        "playerId",
        history.map((vote) => vote.playerId)
    );

    return (
        <Center
            w="300px"
            h="200px"
            bgSize="cover"
            bgPos="50% 50%"
            bgImage={`url(${game.image})`}
            border={`10px solid ${selected === game.id ? "orange" : "black"}`}
            onClick={() => onClick?.(game.id)}
            position="relative"
        >
            <Box position="absolute" top="0" boxSize="100%" padding="20px" zIndex="10">
                <SimpleGrid columns={3} boxSize="100%">
                    {sorted.map((vote) => (
                        <Box
                            key={vote.playerId}
                            borderRadius="50%"
                            boxSize="50px"
                            bgColor={vote ? sliceColor(vote.color) : ""}
                        ></Box>
                    ))}
                </SimpleGrid>
            </Box>
            <Box position="absolute" top="0" color="white" fontWeight="bold" fontSize="24px" zIndex="1">
                {game.id}
            </Box>
        </Center>
    );
};
