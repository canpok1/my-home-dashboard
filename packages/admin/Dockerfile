FROM node:24 AS builder
WORKDIR /src

COPY ./package*.json ./
COPY ./packages/lib/package*.json ./packages/lib/
COPY ./packages/admin/package*.json ./packages/admin/
COPY ./prisma/ ./prisma/
RUN npm ci

COPY ./tsconfig.json ./
COPY ./packages/lib/ ./packages/lib/
COPY ./packages/admin/ ./packages/admin/
RUN npm run -w lib build
RUN npm run -w admin build


FROM node:24-slim
WORKDIR /service

COPY --from=builder /src/packages/admin/.next/standalone ./
COPY --from=builder /src/packages/lib/package*.json ./packages/lib/
COPY --from=builder /src/packages/lib/output ./packages/lib/src/
COPY --from=builder /src/prisma/ ./prisma/

ENV TZ=Asia/Tokyo
ENV NODE_ENV production
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["node", "./packages/admin/server.js"]
