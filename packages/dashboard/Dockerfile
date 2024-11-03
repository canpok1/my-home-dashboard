FROM node:23 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/dashboard/package*.json ./packages/dashboard/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/dashboard/ ./packages/dashboard/
RUN npm run -w lib build
RUN npm run -w dashboard build


FROM node:23-slim
WORKDIR /service
COPY --from=builder /src/packages/dashboard/.output .

RUN apt-get update && apt-get install -y \
    openssl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["node", "--enable-source-maps", "server/index.mjs"]
