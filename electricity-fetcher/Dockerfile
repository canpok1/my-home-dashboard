FROM node:18 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./electricity-fetcher/package*.json ./electricity-fetcher/
RUN npm ci

COPY ./electricity-fetcher/ ./electricity-fetcher/
RUN npm run -w electricity-fetcher build

FROM node:18-slim
WORKDIR /service
ENV TZ=Asia/Tokyo

COPY --from=builder /src/package*.json ./
COPY --from=builder /src/electricity-fetcher/package*.json ./electricity-fetcher/
COPY --from=builder /src/electricity-fetcher/output ./electricity-fetcher/output/

RUN apt-get update && apt-get install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm run -w electricity-fetcher install:chromium \
 && npm ci --production


ENTRYPOINT ["node", "electricity-fetcher/output/App.js"]
