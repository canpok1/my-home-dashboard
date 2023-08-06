FROM migrate/migrate:latest

COPY ./packages/migrate/ /workspace/
RUN apk add make

WORKDIR /workspace
ENTRYPOINT ["make"]
CMD ["migrate-version"]
