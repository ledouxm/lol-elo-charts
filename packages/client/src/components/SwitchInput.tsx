import { FormControl, FormLabel, Switch, SwitchProps, forwardRef, FormControlProps } from "@chakra-ui/react";
import React from "react";

export const SwitchInput = forwardRef(
    ({ label, wrapperProps, ...props }: SwitchInputProps & { wrapperProps?: FormControlProps }, ref) => {
        return (
            <FormControl display="flex" alignItems="center" {...wrapperProps}>
                <FormLabel htmlFor={props.id} mb="0">
                    {label}
                </FormLabel>
                <Switch {...props} ref={ref} id={props.id} />
            </FormControl>
        );
    }
);

export type SwitchInputProps = SwitchProps & {
    label: string;
};
