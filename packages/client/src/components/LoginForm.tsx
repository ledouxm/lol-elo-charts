import { api, getAccessToken, persistAccessToken } from "@/api";
import { onAxiosError, successToast } from "@/functions/toasts";
import { getRandomColor, makeId } from "@/functions/utils";
import { persistLocalPresence } from "@/hooks/usePresence";
import { Button, Center, Flex, Stack } from "@chakra-ui/react";
import { getRandomIntIn } from "@pastable/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";
import { SwitchInput } from "./SwitchInput";
import { TextInput } from "./TextInput";

const login = (values: LoginFormValues) => api.post("/auth/login", values).then((res) => res.data);
const createUser = (values: LoginFormValues) => api.post("/auth/register", values).then((res) => res.data);

export const LoginForm = () => {
    const { register, handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: { name: "Guest-" + getRandomIntIn(0, 1000), password: "", type: "login", asGuest: true },
    });
    const setType = (type: "login" | "create") => setValue("type", type);

    const router = useHistory();
    const loginMutation = useMutation(login, {
        onSuccess: (data) => {
            persistLocalPresence({
                id: data.id || "g-" + makeId(),
                username: data.username,
                color: data.color || getRandomColor(),
            });
            persistAccessToken(data.token);
            router.push("/app/");
            successToast({ title: `Successfully logged` });
        },
        onError: onAxiosError,
    });

    const createMutation = useMutation(createUser, {
        onSuccess: (data) => {
            persistLocalPresence({ id: data.id, username: data.username, color: data.color || getRandomColor() });
            persistAccessToken(data.token);
            router.push("/app/");
            successToast({ title: `Account created` });
        },
        onError: onAxiosError,
    });

    const onSubmit = (values: LoginFormValues) =>
        getValues("type") === "login" ? loginMutation.mutate(values) : createMutation.mutate(values);

    const isAsGuest = watch("asGuest");

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            router.replace("/app");
        }
    }, []);

    return (
        <Stack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4}>
            <Stack direction="row">
                <TextInput label="Username" {...register("name", { required: true })} />
                {!isAsGuest && <TextInput label="Password" type="password" {...register("password")} />}
            </Stack>
            <Center>
                <SwitchInput
                    label={isAsGuest ? "Without account" : "As user"}
                    colorScheme="red"
                    {...register("asGuest")}
                    wrapperProps={{ w: "auto" }}
                />
            </Center>
            <Flex direction="row-reverse" justifyContent={isAsGuest ? "center" : "space-around"}>
                <Button type="submit" onClick={() => setType("login")} colorScheme="twitter">
                    Login
                </Button>
                {/* Reversing the order of btns so that the first one (Login) will get triggered on ENTER key submit */}
                {!isAsGuest && (
                    <Button type="submit" onClick={() => setType("create")}>
                        Register
                    </Button>
                )}
            </Flex>
        </Stack>
    );
};

interface LoginFormValues {
    name: string;
    password?: string;
}
