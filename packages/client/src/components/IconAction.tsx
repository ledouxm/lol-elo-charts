import { Box, BoxProps, Tooltip, TooltipProps } from "@chakra-ui/react";
import React, { MutableRefObject } from "react";
import { IconType } from "react-icons";

export const IconAction = ({
    icon,
    label,
    placement = "auto",
    isDisabled,
    tooltipProps,
    containerRef,
    ...props
}: IconActionProps) => {
    return (
        <Tooltip
            hasArrow
            shouldWrapChildren
            label={label}
            aria-label={label}
            placement={placement}
            isDisabled={isDisabled}
            portalProps={{ containerRef }}
            {...tooltipProps}
        >
            <Box
                as={icon}
                fontSize="25px"
                transition="transform .2s"
                transitionProperty="transform, opacity"
                h="20px"
                w="20px"
                _hover={isDisabled ? {} : { transform: "scale(1.2)", opacity: 1 }}
                opacity={isDisabled ? 0.3 : 0.6}
                cursor={isDisabled ? "not-allowed" : "pointer"}
                {...props}
            />
        </Tooltip>
    );
};

export type IconActionProps = {
    icon: IconType;
    label: TooltipProps["aria-label"];
    placement?: TooltipProps["placement"];
    isDisabled?: TooltipProps["isDisabled"];
    tooltipProps?: Omit<TooltipProps, "children">;
    containerRef?: MutableRefObject<HTMLElement>;
} & BoxProps;
