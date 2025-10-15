import { Autocomplete, Box, Button, FormControl, Input, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useRef, useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

export const DuoqForm = ({ defaultValues, isInline }: { defaultValues?: Partial<Form>; isInline?: boolean } = {}) => {
    const form = useForm<Form>({
        defaultValues: {
            summoner1: defaultValues?.summoner1 || "",
            summoner2: defaultValues?.summoner2 || "",
        },
    });

    const navigate = useNavigate();

    const onSubmit = (data: { summoner1: string; summoner2: string }) => {
        navigate({ to: "/duoq", search: { summoner1: data.summoner1, summoner2: data.summoner2 } });
    };

    return (
        <Box
            component="form"
            display="flex"
            flexDirection={isInline ? "row" : "column"}
            gap={2}
            width="100%"
            py="50px"
            alignItems="center"
            onSubmit={form.handleSubmit(onSubmit)}
            bgcolor="background.default"
            px="50px"
            borderRadius={4}
            sx={{
                boxShadow: 1,
            }}
        >
            <Box display="flex" gap={2} width="100%">
                <SummonerAutocomplete form={form} name="summoner1" />
                <TextField
                    label="Summoner 2"
                    variant="standard"
                    sx={{ "::after": { borderColor: "white" }, flex: 1 }}
                    placeholder="Summoner 2"
                    {...form.register("summoner2", { required: "Summoner 2 is required" })}
                    error={!!form.formState.errors.summoner2}
                />
            </Box>

            <Button variant="contained" color="primary" sx={{ width: "90px", bgcolor: "white" }} type="submit">
                Search
            </Button>
        </Box>
    );
};

export const SummonerAutocomplete = <T extends FieldValues>({
    form,
    name,
}: {
    form: UseFormReturn<T>;
    name: Path<T>;
}) => {
    const [inputValue, setInputValue] = useState("");
    const optionsQuery = useQuery({
        queryKey: ["summoner-options", inputValue],
        queryFn: () => api.getAvailableSummoners(inputValue).then((res) => res.map((s) => s.name)),
    });

    const { errors } = form.formState;
    const isError = !!errors[name];

    form.register(name, { required: `${name} is required` });

    return (
        <Autocomplete
            sx={{ flex: 1 }}
            options={optionsQuery.data || []}
            getOptionKey={(option) => option}
            inputValue={inputValue}
            value={form.getValues(name)}
            getOptionLabel={(option) => option}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
                form.setValue(name, newValue || ("" as any));
            }}
            disablePortal
            renderInput={(params) => (
                <TextField
                    sx={{
                        "::after": { borderColor: "white" },
                    }}
                    variant="standard"
                    error={isError}
                    {...params}
                    label="Summoner 1"
                />
            )}
        />
    );
};

type Form = {
    summoner1: string;
    summoner2: string;
};
