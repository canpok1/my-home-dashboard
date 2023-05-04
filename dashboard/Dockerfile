FROM node:18 AS builder
WORKDIR /src

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY ./ .
RUN npm run build

FROM node:18-slim
ENV PORT=80
WORKDIR /service
COPY --from=builder /src/.output .
ENTRYPOINT ["node", "server/index.mjs"]
