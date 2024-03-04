# syntax=docker/dockerfile:1
# install pnpm
FROM nikolaik/python-nodejs:latest AS with-pnpm

RUN npm i -g pnpm
RUN apt-get update
RUN apt-get install -y openssl

# install deps
FROM with-pnpm AS deps

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY ./pnpm-lock.yaml /app
COPY ./package.json /app
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
  
RUN pnpm install --frozen-lockfile

# build
FROM with-pnpm AS build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY ./src /app/src
COPY ./drizzle /app/drizzle
COPY ./package.json /app
COPY ./tsconfig.json /app

RUN pnpm build

# start production environment
FROM with-pnpm

WORKDIR /app
COPY --from=build /app ./

EXPOSE 8080

ENV HTTP_PORT=8080
CMD NODE_ENV=production HTTP_PORT=8080 pnpm start

