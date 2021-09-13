import { Box, BoxProps, Tooltip, TooltipProps } from "@chakra-ui/react";
import { MutableRefObject, forwardRef } from "react";
import { IconType } from "react-icons";
import { BsThreeDotsVertical } from "react-icons/bs";

export const IconAction = forwardRef(
    ({ icon, label, placement = "auto", isDisabled, tooltipProps, containerRef, ...props }: IconActionProps, ref) => {
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
                    ref={ref as any}
                    fontSize="25px"
                    transition="transform .2s"
                    transitionProperty="transform, opacity"
                    h="20px"
                    w="20px"
                    _hover={isDisabled ? {} : { transform: "scale(1.2)", opacity: 1 }}
                    opacity={isDisabled ? 0.3 : 0.6}
                    cursor={isDisabled ? "not-allowed" : "pointer"}
                    {...props}
                >
                    <Box as={icon} boxSize="100%" />
                </Box>
            </Tooltip>
        );
    }
);

export type IconActionProps = {
    icon: IconType;
    label: TooltipProps["aria-label"];
    placement?: TooltipProps["placement"];
    isDisabled?: TooltipProps["isDisabled"];
    tooltipProps?: Omit<TooltipProps, "children">;
    containerRef?: MutableRefObject<HTMLElement>;
} & BoxProps;

export const DotsIconAction = forwardRef((props, ref) => (
    <IconAction ref={ref} icon={BsThreeDotsVertical} label="Menu" {...props} />
));
