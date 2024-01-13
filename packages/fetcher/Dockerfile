FROM node:18 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/fetcher/package*.json ./packages/fetcher/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/fetcher/ ./packages/fetcher/
RUN npm run -w lib build
RUN npm run -w fetcher build
 

FROM node:18-slim
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/src/
COPY --from=builder /src/packages/fetcher/package*.json ./packages/fetcher/
COPY --from=builder /src/packages/fetcher/output ./packages/fetcher/output/
COPY --from=builder /src/prisma/ ./prisma/

RUN apt-get update && apt-get install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm run -w fetcher install:chromium \
 && npm ci --production

ENTRYPOINT ["node", "packages/fetcher/output/App.js"]
