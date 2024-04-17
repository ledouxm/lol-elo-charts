import { ENV } from "./envVars";
import { createApiClient } from "./valorantApi.gen";
import { ofetch } from "ofetch";

export const valorantApi = createApiClient((method, url, parameters) => {
    const withPathVariables = (url: string, path: Record<string, any>) => {
        return url.replace(/{([^}]+)}/g, (_, key) => {
            return path[key];
        });
    };

    return ofetch("https://api.henrikdev.xyz" + withPathVariables(url, parameters?.path), {
        method,
        query: parameters?.query,
        body: parameters?.body as any,
        headers: { ...(parameters?.header as Record<string, string>), Authorization: ENV.VALORANT_API_KEY },
        params: parameters?.path,
    });
});
