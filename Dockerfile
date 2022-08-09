# syntax=docker/dockerfile:1
# install pnpm
FROM node:16-slim AS with-pnpm

RUN npm i -g pnpm
RUN apt-get update
RUN apt-get install -y openssl
# https://github.com/prisma/prisma/issues/8783

# install deps
FROM with-pnpm AS deps

WORKDIR /app

COPY ./packages/server/pnpm-lock.yaml /app
COPY ./packages/server/package.json /app
RUN pnpm install --frozen-lockfile

# build
FROM with-pnpm AS build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY ./packages/server/src /app/src
COPY ./packages/server/package.json /app
COPY ./packages/server/env.yaml /app
COPY ./packages/server/tsconfig.json /app
COPY ./packages/server/tsconfig.build.json /app
COPY ./packages/server/mikro-orm.config.js /app

# https://github.com/prisma/prisma/issues/8783

RUN pnpm build

# start production environment
FROM with-pnpm

WORKDIR /app
COPY --from=build /app ./

EXPOSE 8080 1337

ENV PORT=8080
CMD NODE_ENV=production pnpm start



# FROM mhart/alpine-node:16

# WORKDIR /app

# COPY packages/server/package.json /app
# COPY packages/server/yarn.lock /app

# RUN yarn install
# COPY ./packages/server/ /app
# RUN yarn build

# ENV DEBUG=*

# CMD ls /app && yarn start

# EXPOSE 8080