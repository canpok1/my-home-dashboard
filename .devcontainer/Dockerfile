FROM node:23

ENV TZ=Asia/Tokyo
ENV TBLS_VERSION=1.79.0
ENV MIGRATE_VERSION=4.18.1

RUN \
  curl -o tbls.deb -L https://github.com/k1LoW/tbls/releases/download/v${TBLS_VERSION}/tbls_${TBLS_VERSION}-1_arm64.deb \
  && curl -o migrate.deb -L https://github.com/golang-migrate/migrate/releases/download/v${MIGRATE_VERSION}/migrate.linux-arm64.deb \
  && apt update \
  && apt install -y \
    fonts-ipafont-gothic \
    fonts-ipafont-mincho \
    ./tbls.deb \
    ./migrate.deb \
  && rm *.deb
