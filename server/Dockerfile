FROM node:alpine3.23

WORKDIR /app

COPY ./package*.json .

RUN npm ci

COPY . .