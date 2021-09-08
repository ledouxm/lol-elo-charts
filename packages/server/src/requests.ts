import { isDev } from "@pastable/utils";
import { FastifyRequest, FastifyReply } from "fastify";

import { makeDebug } from "@/utils";
import { getUserByTokenOrFail } from "./auth";
import { User } from "./entities/User";

const debug = makeDebug("requests");

export const handleRequest =
    <T = any>(action: Action<T>) =>
    async (request: FastifyRequest, response: FastifyReply) => {
        const params = mergeParams(request) as T;
        return handleAction(action, params, request, response);
    };

export const handleAuthenticatedRequest =
    <T = any>(action: Action<WithAccessToken & { user: User } & T>) =>
    async (request: FastifyRequest, response: FastifyReply) => {
        if (!request.headers.authorization)
            return handleError(new HTTPError("Unauthenticated user", 401), request, response);

        try {
            const user = await getUserByTokenOrFail(request.headers.authorization);

            const params = { ...mergeParams(request), access_token: request.headers.authorization, user };
            return handleAction(action, params, request, response);
        } catch (error) {
            return handleError(error as HTTPError, request, response);
        }
    };

export type Action<Params, Return = any> = (
    params: Params,
    request: FastifyRequest,
    response: FastifyReply
) => Return | Promise<Return>;

/** Merge parameters from POST and GET query */
const mergeParams = (request: FastifyRequest) => {
    const { query, body, params } = request as any;
    return { ...query, ...body, ...params };
};

/**
 * If execution of action function throws an error, its handled with a
 * response reflecting error type
 */
const handleAction = async <T = any>(action: Action<T>, params: T, request: FastifyRequest, response: FastifyReply) => {
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

const handleError = (error: HTTPError, req: FastifyRequest, res: FastifyReply) =>
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
