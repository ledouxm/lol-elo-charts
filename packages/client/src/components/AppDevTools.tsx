import { Stack, StackProps } from "@chakra-ui/react";

export const AppDevTools = (props: StackProps) => {
    return <Stack position="fixed" bottom="0" right="0" {...props}></Stack>;
};
