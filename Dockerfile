FROM node:18-alpine

RUN apk add --no-cache lame

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci && mkdir public

COPY index.js .

ENTRYPOINT [ "node", "./index.js" ]