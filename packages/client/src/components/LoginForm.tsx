import { api, getAccessToken, persistAccessToken } from "@/api";
import { onAxiosError, successToast } from "@/functions/toasts";
import { getRandomColor, makeId } from "@/functions/utils";
import { persistLocalPresence, persistRoles, useSetRoles } from "@/hooks/usePresence";
import { Button, Center, Flex, Stack } from "@chakra-ui/react";
import { atomWithToggleAndStorage, getRandomIntIn } from "@pastable/core";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";
import { SwitchInput } from "./SwitchInput";
import { TextInput } from "./TextInput";

const login = (values: LoginFormValues) => api.post("/auth/login", values).then((res) => res.data);
const createUser = (values: LoginFormValues) => api.post("/auth/register", values).then((res) => res.data);

const isRegisterFormAtom = atomWithToggleAndStorage("wss/isRegisterForm");

export const LoginForm = () => {
    const [isRegisterForm, setIsRegisterForm] = useAtom(isRegisterFormAtom);
    const { register, handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: {
            name: "Guest-" + getRandomIntIn(0, 1000),
            password: "",
            type: isRegisterForm ? "register" : "login",
        },
    });
    const setType = (type: "login" | "create") => setValue("type", type);

    const router = useHistory();
    const setRoles = useSetRoles();
    const loginMutation = useMutation(login, {
        onSuccess: (data) => {
            persistLocalPresence({
                id: data.id || "g-" + makeId(),
                username: data.username,
                color: data.color || getRandomColor(),
            });
            persistRoles(data.roles || []);
            persistAccessToken(data.token);

            setRoles(data.roles || []);
            router.push("/app/");
            successToast({ title: `Successfully logged` });
        },
        onError: onAxiosError,
    });

    const createMutation = useMutation(createUser, {
        onSuccess: (data) => {
            persistLocalPresence({
                id: data.id,
                username: data.username,
                color: data.color || getRandomColor(),
            });
            persistRoles(data.roles || []);
            persistAccessToken(data.token);

            setRoles(data.roles || []);
            router.push("/app/");
            successToast({ title: `Account created` });
        },
        onError: onAxiosError,
    });

    const onSubmit = (values: LoginFormValues) =>
        getValues("type") === "login" ? loginMutation.mutate(values) : createMutation.mutate(values);

    const isLoginForm = watch("type") === "login";

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
                {!isLoginForm && <TextInput label="Password" type="password" {...register("password")} />}
            </Stack>
            <Center>
                <SwitchInput
                    label={isLoginForm ? "Without account" : "As user"}
                    colorScheme="red"
                    defaultChecked={!isRegisterForm}
                    onChange={(event) => {
                        setIsRegisterForm(!event.target.checked);
                        setValue("type", event.target.checked ? "login" : "register");
                    }}
                    wrapperProps={{ w: "auto" }}
                />
            </Center>
            <Flex direction="row-reverse" justifyContent={isLoginForm ? "center" : "space-around"}>
                <Button type="submit" onClick={() => setType("login")} colorScheme="twitter">
                    Login
                </Button>
                {/* Reversing the order of btns so that the first one (Login) will get triggered on ENTER key submit */}
                {!isLoginForm && (
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
