FROM node:22 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/notifier/package*.json ./packages/notifier/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/notifier/ ./packages/notifier/
RUN npm run -w packages/lib build
RUN npm run -w packages/notifier build
 

FROM node:22-slim
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/src/
COPY --from=builder /src/packages/notifier/package*.json ./packages/notifier/
COPY --from=builder /src/packages/notifier/output ./packages/notifier/src/
COPY --from=builder /src/prisma/ ./prisma/

RUN apt-get update && apt-get install -y \
    openssl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm ci --omit=dev \
 && npx prisma generate

ENTRYPOINT ["node", "packages/notifier/src/App.js"]
