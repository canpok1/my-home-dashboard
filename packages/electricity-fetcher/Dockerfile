FROM node:18 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/electricity-fetcher/package*.json ./packages/electricity-fetcher/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/electricity-fetcher/ ./packages/electricity-fetcher/
RUN npm run -w lib build
RUN npm run -w electricity-fetcher build
 

FROM node:18-slim
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/output/
COPY --from=builder /src/packages/electricity-fetcher/package*.json ./packages/electricity-fetcher/
COPY --from=builder /src/packages/electricity-fetcher/output ./packages/electricity-fetcher/output/
COPY --from=builder /src/prisma/ ./prisma/

RUN apt-get update && apt-get install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm run -w electricity-fetcher install:chromium \
 && npm ci --production

ENTRYPOINT ["node", "packages/electricity-fetcher/output/App.js"]
