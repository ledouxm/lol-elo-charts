# syntax=docker/dockerfile:1
# install pnpm
FROM node:16-slim AS with-pnpm

RUN npm i -g pnpm
RUN apt-get update
RUN apt-get install -y openssl

# install deps
FROM with-pnpm AS deps

WORKDIR /app

COPY ./pnpm-lock.yaml /app
COPY ./package.json /app
RUN pnpm install --frozen-lockfile

# build
FROM with-pnpm AS build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY ./src /app/src
COPY ./package.json /app
COPY ./tsconfig.json /app
COPY ./tsconfig.build.json /app
COPY ./mikro-orm.config.js /app

RUN pnpm build

# start production environment
FROM with-pnpm

WORKDIR /app
COPY --from=build /app ./

CMD NODE_ENV=production pnpm start

