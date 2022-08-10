import { makeDebug } from "@/utils";

import { User } from "./entities/User";

export const isDev = () => process.env.NODE_ENV === "development";
const debug = makeDebug("requests");

export const handleRequest =
    <T = any>(action: Action<T>) =>
    async (request: any, response: any) => {
        const params = mergeParams(request) as T;
        return handleAction(action, params, request, response);
    };

export const handleAuthenticatedRequest =
    <T = any>(action: Action<WithAccessToken & { user: User } & T>) =>
    async (request: any, response: any) => {
        if (!request.headers.authorization)
            return handleError(new HTTPError("Unauthenticated user", 401), request, response);

        try {
            const user = { oui: "oui" };

            const params = { ...mergeParams(request), access_token: request.headers.authorization, user };
            return handleAction(action, params, request, response);
        } catch (error) {
            return handleError(error as HTTPError, request, response);
        }
    };

export type Action<Params, Return = any> = (params: Params, request: any, response: any) => Return | Promise<Return>;

/** Merge parameters from POST and GET query */
const mergeParams = (request: any) => {
    const { query, body, params } = request as any;
    return { ...query, ...body, ...params };
};

/**
 * If execution of action function throws an error, its handled with a
 * response reflecting error type
 */
const handleAction = async <T = any>(action: Action<T>, params: T, request: any, response: any) => {
    try {
        const result = await action(params, request, response);
        return response.status(200).send(result);
    } catch (error) {
        if (error instanceof HTTPError) return response.status(error.code).send(error.response);

        debug(error);
        return (
            response
                .status(500)
                // @ts-ignore
                .send(isDev() ? { error: error.message, stack: error.stack } : { error: "Unexpected error" })
        );
    }
};

const handleError = (error: HTTPError, req: any, res: any) =>
    handleAction(
        () => {
            throw error;
        },
        null,
        req,
        res
    );

export interface WithAccessToken {
    access_token: string;
}

export class HTTPError extends Error {
    code: number;
    response: any;

    constructor(error: string, code = 500, additionnalParams = {}) {
        super(`An HTTP ${code} error has occured`);
        this.response = { error, ...additionnalParams };
        this.code = code;
    }
}
