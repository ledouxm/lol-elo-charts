import { HttpClient, HttpClientError, HttpClientRequest } from "@effect/platform";
import { Context, Effect, Layer, Redacted } from "effect";
import {
    type EndpointParameters,
    type GetEndpoints,
    type Method,
    type PostEndpoints,
    type PutEndpoints,
} from "../riot-api.gen.ts";
import { AppConfig } from "../app.config.ts";

type RequiredKeys<T> = { [P in keyof T]-?: undefined extends T[P] ? never : P }[keyof T];
type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];

class EffectRiotApiClient {
    httpClient: HttpClient.HttpClient;
    baseUrl: string;

    constructor(httpClient: HttpClient.HttpClient, baseUrl = "") {
        this.httpClient = httpClient;
        this.baseUrl = baseUrl;
    }

    fetch = <T>(
        method: Method,
        url: string,
        body?: EndpointParameters
    ): Effect.Effect<T, HttpClientError.HttpClientError> =>
        HttpClientRequest.make(method.toUpperCase() as Uppercase<Method>)(this.baseUrl + url).pipe(
            HttpClientRequest.bodyJson(body),
            Effect.flatMap(this.httpClient.execute),
            Effect.flatMap((response) => response.json)
        ) as Effect.Effect<T, HttpClientError.HttpClientError>;

    get = <Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
        path: Path,
        ...params: MaybeOptionalArg<TEndpoint["parameters"]>
    ): Effect.Effect<TEndpoint["response"], HttpClientError.HttpClientError> => this.fetch("get", path, params[0]);

    post = <Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
        path: Path,
        ...params: MaybeOptionalArg<TEndpoint["parameters"]>
    ): Effect.Effect<TEndpoint["response"], HttpClientError.HttpClientError> => this.fetch("post", path, params[0]);

    put = <Path extends keyof PutEndpoints, TEndpoint extends PutEndpoints[Path]>(
        path: Path,
        ...params: MaybeOptionalArg<TEndpoint["parameters"]>
    ): Effect.Effect<TEndpoint["response"], HttpClientError.HttpClientError> => this.fetch("put", path, params[0]);
}

export class RiotClient extends Context.Tag("RiotClient")<RiotClient, EffectRiotApiClient>() {}

const makeRiotClient = Effect.gen(function* () {
    const config = yield* AppConfig;
    const defaultClient = yield* HttpClient.HttpClient;
    const httpClient = defaultClient.pipe(
        HttpClient.mapRequest(HttpClientRequest.setHeader("X-Riot-Token", Redacted.value(config.riot.apiKey)))
    );
    return new EffectRiotApiClient(httpClient);
});

export const RiotClientLive = Layer.effect(RiotClient, makeRiotClient);
