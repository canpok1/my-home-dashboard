FROM golang:1.20

RUN go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

ENTRYPOINT ["migrate"]
CMD ["-help"]
