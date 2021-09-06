import { Text, TextProps } from "@chakra-ui/react";

export const responsiveFontSizes = {
    mini: ["xx-small", null, "xs", null, "sm"],
    xs: ["xs", null, "sm", null, "md"],
    sm: ["sm", null, "md", null, "lg"],
    md: ["md", null, "lg", null, "xl"],
    lg: ["lg", null, "xl", null, "2xl"],
    xl: ["xl", null, "2xl", null, "3xl"],
    fat: ["2xl", null, "3xl", null, "4xl"],
};

export const MiniText = (props: TextProps) => <Text fontSize={responsiveFontSizes.mini} {...props} />;
export const TinyText = (props: TextProps) => <Text fontSize={responsiveFontSizes.xs} {...props} />;
export const SmallText = (props: TextProps) => <Text fontSize={responsiveFontSizes.sm} {...props} />;
export const MediumText = (props: TextProps) => <Text fontSize={responsiveFontSizes.md} {...props} />;
export const LargeText = (props: TextProps) => <Text fontSize={responsiveFontSizes.lg} {...props} />;
export const BigText = (props: TextProps) => <Text fontSize={responsiveFontSizes.xl} {...props} />;
export const FatText = (props: TextProps) => <Text fontSize={responsiveFontSizes.fat} {...props} />;
