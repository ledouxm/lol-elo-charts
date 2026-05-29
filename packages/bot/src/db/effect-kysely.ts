// oxlint-disable no-extra-bind
import type {
    Compilable,
    Kysely,
    QueryExecutorProvider,
    QueryResult,
    RawBuilder,
    Transaction,
    TransactionBuilder,
} from "kysely";

import { SqlError } from "@effect/sql/SqlError";
import { Array, Data, Effect, Option } from "effect";

// taken from https://github.com/Effect-TS/effect/pull/5156

interface EffectExecutor {
    executeRaw: <O>(query: QueryRaw<O>) => Effect.Effect<QueryResult<O>, SqlError>;
    execute: <O>(query: Query<O>) => Effect.Effect<O[], SqlError>;
    executeTakeFirstOption: <O>(query: Query<O>) => Effect.Effect<Option.Option<O>, SqlError>;
    executeTakeFirstOrUndefined: <O>(query: Query<O>) => Effect.Effect<O | undefined, SqlError>;
    executeTakeFirstOrError: <O>(query: Query<O>) => Effect.Effect<O, SqlError | SqlNoFirstResult>;
    executeTakeFirstUnsafe: <O>(query: Query<O>) => Effect.Effect<O, SqlError>;
}

interface EffectTransition<DB>
    extends Omit<Transaction<DB>, "transaction" | "startTransaction" | "executeQuery">, EffectExecutor {}

export interface EffectKysely<DB>
    extends Omit<Kysely<DB>, "transaction" | "startTransaction" | "executeQuery">, EffectExecutor {
    transaction: () => Omit<TransactionBuilder<DB>, "execute"> & {
        execute: <A, E>(f: (trx: EffectTransition<DB>) => Effect.Effect<A, E>) => Effect.Effect<A, E>;
    };
}

// const db: EffectKysely<{
//     key_value: {
//      name: ColumnType<string, string, string>;
//     id: ColumnType<string, string, string>;
//     }
// }> = {}

// db.selectFrom("key_value").select(["id", "name"]).execute

const makeExecutor = <DB>(client: Kysely<DB>): EffectExecutor => ({
    executeRaw: executeRaw(client).bind(client),
    execute: execute(client).bind(client),
    executeTakeFirstOption: executeTakeFirstOption(client).bind(client),
    executeTakeFirstOrUndefined: executeTakeFirstOrUndefined(client).bind(client),
    executeTakeFirstOrError: executeTakeFirstOrError(client).bind(client),
    executeTakeFirstUnsafe: executeTakeFirstUnsafe(client).bind(client),
});

export const makeFromKysely = <DB>(kysely: Kysely<DB>): EffectKysely<DB> => {
    const kyselyTransaction = kysely.transaction.bind(kysely);
    return Object.assign(kysely, {
        ...makeExecutor(kysely),
        transaction: (() => {
            const builder = kyselyTransaction();

            const kyselyBuilderExecute = builder.execute.bind(builder);

            return Object.assign(builder, {
                execute: (<A, E>(f: (trx: EffectTransition<DB>) => Effect.Effect<A, E>) => {
                    return Effect.async<A, E>((resume) => {
                        kyselyBuilderExecute((trx) => Effect.runPromise(f(Object.assign(trx, makeExecutor(trx)))))
                            .then((a) => resume(Effect.succeed(a)))
                            .catch((e) => resume(Effect.fail(e as E)));
                    });
                }).bind(builder),
            });
        }).bind(kysely),
    });
};

interface Executable<O> extends Compilable<O> {
    execute: () => Promise<undefined | O[]>;
}

interface ExecutableRaw<O> extends Executable<O>, QueryExecutorProvider {}

type Query<O> = Executable<O> | RawBuilder<O>;
type QueryRaw<O> = ExecutableRaw<O> | RawBuilder<O>;

const isRawBuilder = <O>(query: Executable<O> | RawBuilder<O>): query is RawBuilder<O> => {
    return `isRawBuilder` in query && query.isRawBuilder;
};

const queryAsPromise = <DB, O>(client: Kysely<DB>, query: QueryRaw<O>): Promise<QueryResult<O>> => {
    if (isRawBuilder(query)) {
        return query.execute(client);
    }
    const executor = query.getExecutor();
    const compiledQuery = query.compile();
    return executor.executeQuery(compiledQuery);
};

const executeSpan = <TQuery extends Query<any> | QueryRaw<any>>(client: Kysely<any>, query: TQuery) => {
    const compiled = isRawBuilder(query) ? query.compile(client) : query.compile();
    return Effect.withSpan(`kysely.execute`, {
        kind: `client`,
        captureStackTrace: false,
        attributes: {
            sql: compiled.sql,
            // params: compiled.parameters,
        },
    });
};

const executeRaw =
    <DB>(client: Kysely<DB>) =>
    <O>(query: QueryRaw<O>) =>
        Effect.tryPromise({
            try: () => queryAsPromise(client, query),
            catch: (cause) => {
                return new SqlError({
                    cause,
                    message:
                        cause instanceof Error
                            ? `[executeRaw] SqlError: ${cause.message}\n\n query:\n ${query.compile(client).sql}`
                            : `[executeRaw] An error has occurred with the query: ${query.compile(client).sql}`,
                });
            },
        }).pipe(executeSpan(client, query));

const execute =
    <DB>(client: Kysely<DB>) =>
    <O>(query: Query<O>) =>
        Effect.tryPromise({
            try: () =>
                isRawBuilder(query)
                    ? queryAsPromise(client, query).then((result) => result.rows)
                    : query.execute().then((result) => result ?? []),
            catch: (cause) => {
                return new SqlError({
                    cause,
                    message:
                        cause instanceof Error
                            ? `[execute] SqlError: ${cause.message}\n\n query:\n ${query.compile(client).sql}`
                            : `[execute] An error has occurred with the query: ${query.compile(client).sql}`,
                });
            },
        }).pipe(executeSpan(client, query));

const executeTakeFirstOption =
    <DB>(client: Kysely<DB>) =>
    <O>(query: Query<O>) =>
        execute(client)(query).pipe(
            Effect.map((result) => (Array.isNonEmptyReadonlyArray(result) ? Option.some(result[0]) : Option.none()))
        );

const executeTakeFirstOrUndefined =
    <DB>(client: Kysely<DB>) =>
    <O>(query: Query<O>) =>
        executeTakeFirstOption(client)(query).pipe(Effect.map((result) => Option.getOrUndefined(result)));

/**
 * An error that occurs when attempting to access the first returned row of a query result that is empty.
 */
export class SqlNoFirstResult extends Data.TaggedError(`SqlNoFirstResult`)<{}> {
    override toString(): string {
        return `SqlNoFirstResult: query result is empty, no first row available`;
    }
}

const executeTakeFirstOrError =
    <DB>(client: Kysely<DB>) =>
    <O>(query: Query<O>) =>
        executeTakeFirstOption(client)(query).pipe(
            Effect.flatMap((result) => Effect.mapError(result, () => new SqlNoFirstResult()))
        );

const executeTakeFirstUnsafe =
    <DB>(client: Kysely<DB>) =>
    <O>(query: Query<O>) =>
        execute(client)(query).pipe(Effect.map((result) => Array.unsafeGet(result, 0)));
