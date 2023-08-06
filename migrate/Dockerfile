FROM migrate/migrate:latest

COPY ./migrate/ /workspace/
RUN apk add make

WORKDIR /workspace
ENTRYPOINT ["make"]
CMD ["migrate-version"]
