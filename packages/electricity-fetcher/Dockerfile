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
 

FROM mcr.microsoft.com/playwright:v1.37.0-jammy
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/output/
COPY --from=builder /src/packages/electricity-fetcher/package*.json ./packages/electricity-fetcher/
COPY --from=builder /src/packages/electricity-fetcher/output ./packages/electricity-fetcher/output/
COPY --from=builder /src/prisma/ ./prisma/

RUN npm ci --production

ENTRYPOINT ["node", "packages/electricity-fetcher/output/App.js"]
