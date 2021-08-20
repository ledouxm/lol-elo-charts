import { MikroORM, Options, RequestContext } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { HTTPError } from "./requests";

import { makeDebug } from "./utils";

const debug = makeDebug("orm");
export const defaultDbConfig: Options = {
    type: "postgresql",
    dbName: process.env.POSTGRES_DB || "platformer",
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    user: process.env.POSTGRES_USER || "postgres",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    password: process.env.POSTGRES_PASSWORD || "",
    entities: ["./dist/entities"],
    entitiesTs: ["./src/entities"],
    metadataProvider: TsMorphMetadataProvider,
    // debug: ["query"],
};

const ref = { orm: null as any as MikroORM };

export type MakeOrmOptions = { config?: Partial<Options> };

const getPostgresConnectionString = (config: Options) =>
    `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.dbName}`;

export const makeConnection = (configProp?: Options) => MikroORM.init({ ...defaultDbConfig, ...configProp });
export const makeOrm = async ({ config: configProp }: MakeOrmOptions = {}) => {
    const config = { ...defaultDbConfig, ...configProp };
    debug(`connecting to... ${getPostgresConnectionString(config)}`);
    ref.orm = await makeConnection(config);
    debug(`connected !`);

    return ref.orm;
};
export const getOrm = () => ref.orm;
export const setOrm = (orm: MikroORM) => (ref.orm = orm);
export const getEm = () => {
    const em = RequestContext.getEntityManager();
    // if (isTest()) return getOrm().em as EntityManager;
    if (!em) throw new HTTPError("No request context");

    return em as EntityManager;
};

export type EM = ReturnType<typeof getEm>;
export interface WithEm {
    em: EM;
}
