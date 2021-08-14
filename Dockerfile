# v14
FROM mhart/alpine-node:14 

WORKDIR /app

COPY packages/server/package.json /app
COPY packages/server/yarn.lock /app

RUN yarn install
COPY ./packages/server/ /app
RUN yarn build

ENV DEBUG=*

CMD ls /app && yarn start

EXPOSE 8080