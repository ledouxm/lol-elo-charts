import { MikroORM, Options, RequestContext } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { HTTPError } from "./httpUtils/errors";
import defaultDbConfig from "./mikro-orm.config";
import { makeDebug } from "./utils";

const debug = makeDebug("orm");

const ref = { orm: null as any as MikroORM };

export type MakeOrmOptions = { config?: Partial<Options> };

const getPostgresConnectionString = (config: Options) =>
    `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.dbName}`;

export const makeConnection = (configProp?: Options) => MikroORM.init(configProp);
export const makeOrm = async ({ config: configProp }: MakeOrmOptions = {}) => {
    const config = { ...defaultDbConfig, ...configProp };
    debug(`connecting to... ${getPostgresConnectionString(config)}`);
    ref.orm = await makeConnection(config);
    debug(`connected !`);

    const migrator = ref.orm.getMigrator();
    await migrator.up();

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
