################################
# BASE IMAGE FOR EVERY SERVICE #
################################
FROM node:18 AS with-pnpm
RUN npm i -g pnpm@10.12.4
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

################################
#      DEPS INSTALLATION       #
################################
FROM with-pnpm AS with-deps
WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/templates/package.json ./packages/templates/
COPY packages/templates/panda.config.ts ./packages/templates/
COPY packages/core/vite.config.ts ./packages/core/
COPY packages/templates/vite.config.ts ./packages/templates/
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile

################################
#    PUPPETEER INSTALLATION    #
################################
FROM with-deps AS core
WORKDIR /usr/src/app

COPY ./packages/core/ ./packages/core/
COPY ./packages/templates/ ./packages/templates/

COPY --from=with-deps /usr/src/app/packages/core/node_modules ./packages/core/node_modules
COPY --from=with-deps /usr/src/app/packages/templates/node_modules ./packages/templates/node_modules

RUN pnpm templates panda
RUN pnpm core build
CMD NODE_ENV=production HTTP_PORT=8080 pnpm core start
