import { Context, Layer } from "effect";

export interface Database {
    // query methods will go here (Phase 2)
}

export class DatabaseService extends Context.Tag("DatabaseService")<
    DatabaseService,
    Database
>() {}

export const DatabaseLayer = Layer.effect(DatabaseService,
    // connect + migrate here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    null as any
);
