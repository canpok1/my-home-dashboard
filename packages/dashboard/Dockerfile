FROM node:18 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/dashboard/package*.json ./packages/dashboard/
COPY ./packages/dashboard/prisma/ ./packages/dashboard/prisma/
RUN npm ci

COPY ./packages/dashboard/ ./packages/dashboard/
RUN npm run -w dashboard build

FROM node:18-slim
WORKDIR /service
COPY --from=builder /src/packages/dashboard/.output .

RUN apt-get update && apt-get install -y \
    openssl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["node", "server/index.mjs"]
