FROM node:22

ENV TZ=Asia/Tokyo

ENV GOLANG_VERSION=1.20.6
RUN curl -L https://go.dev/dl/go${GOLANG_VERSION}.linux-arm64.tar.gz | tar zx -C /
ENV GOPATH=/go
ENV PATH=/go/bin:/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN go install github.com/k1LoW/tbls@v1.71.1 \
  && go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

RUN apt update && apt install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho
