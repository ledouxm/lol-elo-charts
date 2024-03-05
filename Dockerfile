################################
# BASE IMAGE FOR EVERY SERVICE #
################################
FROM --platform=linux/amd64  node:18 AS with-pnpm
RUN npm i -g pnpm

################################
#      DEPS INSTALLATION       #
################################
FROM with-pnpm AS with-deps
WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/templates/package.json ./packages/templates/
COPY packages/templates/panda.config.ts.json ./packages/templates/
COPY packages/core/vite.config.ts ./packages/core/
COPY packages/templates/vite.config.ts ./packages/templates/

RUN pnpm install --frozen-lockfile

################################
#    PUPPETEER INSTALLATION    #
################################
FROM with-deps AS with-puppeteer
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

FROM with-puppeteer AS core
WORKDIR /usr/src/app
COPY ./packages/core/ ./packages/core/
COPY --from=with-deps /usr/src/app/packages/core/node_modules ./packages/core/node_modules

RUN pnpm --filter core build
CMD ["pnpm", "--filter core", "start"]
# # syntax=docker/dockerfile:1
# # install pnpm
# FROM nikolaik/python-nodejs:latest AS with-pnpm

# RUN npm i -g pnpm
# RUN apt-get update
# RUN apt-get install -y openssl

# # install deps
# FROM with-pnpm AS deps
# WORKDIR /app

# COPY ./pnpm-lock.yaml /app
# COPY ./package.json /app
# COPY ./pnpm-workspace.yaml /app
# COPY ./packages/core/package.json /app/packages/core/package.json
# COPY ./packages/templates /app/packages/templates

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# RUN pnpm --filter core install --frozen-lockfile

# # build
# FROM deps AS build
# WORKDIR /app

# RUN pnpm --filter core build

# # # start production environment
# # FROM with-pnpm

# # WORKDIR /app
# # COPY --from=build /app ./

# # RUN apt-get update && apt-get install gnupg wget -y && \
# #   wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
# #   sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
# #   apt-get update && \
# #   apt-get install google-chrome-stable -y --no-install-recommends && \
# #   rm -rf /var/lib/apt/lists/*


# # EXPOSE 8080

# # ENV HTTP_PORT=8080
# # CMD NODE_ENV=production HTTP_PORT=8080 pnpm --filter core start

