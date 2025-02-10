FROM node:18-alpine AS build-stage

# RUN apk add py3-setuptools make gcc
RUN apk add g++ make py3-pip git

WORKDIR /app

COPY package.json .yarnrc.yml .yarn yarn.lock vite.config.ts nginx.conf tsconfig.json serve.json tsconfig.app.json tsconfig.node.json index.html ./

RUN corepack enable
RUN yarn set version berry
RUN yarn 

COPY ./src ./src
COPY ./public ./public

RUN yarn build


FROM nginx:1.19


COPY --from=build-stage app/dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

COPY entrypoint.sh /docker-entrypoint.d/90-env.sh

RUN chmod +x /docker-entrypoint.d/90-env.sh
