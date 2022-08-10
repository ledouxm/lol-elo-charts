import { Request, Response } from "express";

import { HTTPError, InvalidAccessToken, NoAccessToken, UnauthenticatedUser } from "./errors";

export const handleRequest =
    <T = any>(action: Action<T>) =>
    async (request: Request, response: Response) => {
        const params = mergeParams(request) as T;
        return handleAction(action, params, request, response);
    };

export const handleAuthenticatedRequest =
    <T = any>(action: Action<WithAccessToken & T>) =>
    async (request: Request, response: Response) => {
        if (!request.headers.authorization) return handleError(new UnauthenticatedUser(), request, response);

        const params = { ...mergeParams(request), access_token: request.headers.authorization };
        return handleAction(action, params, request, response);
    };

/** Internal communication from game server to website server */
export const handleInternalRequest =
    <T = any>(action: Action<WithAccessToken & T>) =>
    async (request: Request, response: Response) => {
        if (!request.headers.authorization) return handleError(new NoAccessToken(), request, response);
        if (!isGameAccessToken(request.headers.authorization))
            return handleError(new InvalidAccessToken(), request, response);

        const params = { ...mergeParams(request), access_token: request.headers.authorization };
        return handleAction(action, params, request, response);
    };

export type Action<Params, Return = any> = (
    params: Params,
    request: Request,
    response: Response
) => Return | Promise<Return>;

/** Merge parameters from POST and GET query */
const mergeParams = (request: Request) => {
    const { query, body, params } = request;
    return { ...query, ...body, ...params };
};

/**
 * If execution of action function throws an error, its handled with a
 * response reflecting error type
 */
const handleAction = async <T = any>(action: Action<T>, params: T, request: Request, response: Response) => {
    try {
        const result = await action(params, request, response);
        return response.status(200).json(result);
    } catch (error) {
        if (error instanceof HTTPError) return response.status(error.code).json(error.response);

        return response.status(500).json({ error: "Unexpected error" });
    }
};

const handleError = (error: HTTPError, req: Request, res: Response) =>
    handleAction(
        () => {
            throw error;
        },
        null,
        req,
        res
    );

const isGameAccessToken = (authorization: string) =>
    authorization.indexOf("Bearer ") === 0 ||
    authorization.replace("Bearer ", "") === process.env.GAME_BACK_ACCESS_TOKEN;

export interface WithAccessToken {
    access_token: string;
}
