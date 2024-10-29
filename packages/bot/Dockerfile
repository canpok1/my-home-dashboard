FROM node:22 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/bot/package*.json ./packages/bot/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/bot/ ./packages/bot/
RUN npm run -w packages/lib build
RUN npm run -w packages/bot build
 

FROM node:22-slim
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/src/
COPY --from=builder /src/packages/bot/package*.json ./packages/bot/
COPY --from=builder /src/packages/bot/output ./packages/bot/src/
COPY --from=builder /src/prisma/ ./prisma/

RUN apt-get update && apt-get install -y \
    openssl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm ci --omit=dev \
 && npx prisma generate

ENTRYPOINT ["node", "packages/bot/src/App.js"]
