import { createApiClient } from "./valorantApi.gen";
import { ofetch } from "ofetch";

export const valorantApi = createApiClient((method, url, parameters) => {
    return ofetch("https://api.henrikdev.xyz" + url, {
        method,
        query: parameters?.query,
        body: parameters?.body as any,
        headers: parameters?.header as Record<string, string>,
        params: parameters?.path,
    });
});
type A = "/valorant/v1/account/{name}/{tag}"
type B = "/valorant/v1/account/{name}/oui"
type Aa = ReplaceBrackets<A>
type ReplaceBrackets<T, Current = ""> = T extends `${infer Before}{${string}}${infer After}` ? ReplaceBrackets<`${Before}${string}${After}`, Current> : T