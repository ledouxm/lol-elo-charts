# server

platformer-multiplayer

## Stack

-   Langage: JS via Node 14.x / Typescript 4.3+
-   Router: Fastify
-   Tests: Jest
-   ORM: [Mikro-ORM](https://github.com/mikro-orm/mikro-orm/)
-   Websockets: [ws](https://github.com/websockets/ws)
-   Logs: [debug](https://github.com/visionmedia/debug)
-   Services externes: postgresql + redis

## Installation

```sh
cd packages/server
yarn
```

## env vars

Les vars d'env sont auto-imports/merge via [yenv](https://github.com/jeffijoe/yenv) dans `packages/server/src/envVars.ts`

## Prod build

```sh
yarn build
```

Pour inspecter les vars d'env computed en mode prod: `yarn env:prod`

## Dev

-   Pour lancer les services cruciaux (postgresql + redis) `docker-compose up -d`
-   Pour lancer le projet avec watcher/auto-reload

```sh
yarn dev
```

-   Sinon juste `yarn dev-start` (pour debug via VSCode JS debug terminal c'est mucho pratique)
-   Pour inspecter les vars d'env computed en mode prod: `yarn env`

## Logs

Pour activer les logs, on utilise [debug](https://github.com/visionmedia/debug), il suffit de passer la var d'env `DEBUG="coro*"` pour avoir tous les logs de l'applications, ou restreindre le namespace si besoin.

## Utiles

`docker exec -it platformer-redis redis-cli`

```sh
sadd configuration:whitelist martin
smembers configuration:whitelist
srem configuration:whitelist martin
```

## Auth

ws.onConnection -> MikroORM.RequestContext -> getWsAuthState

### getWsAuthState

-   -> si pw (user)
    -   check que l'user existe + correspond au name+pw envoyés via les crypto hash
    -   si mauvais combo = anti-spam en attendant 2s avant de close la co ws
    -   sinon retourne user trouvé
-   -> sinon (guest), autorise dans tous les cas + génère un id & renvoie le

-   `User["id"]` = est toujours préfixé par "u-"
-   les guests en revanche ont le prefix "g-"
-   que ce soit pour user/guest, on renvoie un access token via jwt

## Namings

-   client = user|guest
-   session = tab open
-   user = registered user
-   guest = unregistered user
