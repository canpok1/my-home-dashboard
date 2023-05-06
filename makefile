include .env

COMPOSE_FILE_PATH=docker-compose-development.yaml
COMPOSE_COMMAND=docker-compose -f ${COMPOSE_FILE_PATH}

DB_URL_FOR_MIGRATE=mysql://${DB_USER}:${DB_PASSWORD}@tcp(${DB_HOST_ON_DOCKER_NETWORK}:${DB_PORT_ON_DOCKER_NETWORK})/${DB_NAME}
DB_URL_FOR_TBLS=mariadb://${DB_USER}:${DB_PASSWORD}@${DB_HOST_ON_DOCKER_NETWORK}:${DB_PORT_ON_DOCKER_NETWORK}/${DB_NAME}
DB_DOC_DIR=doc/database

MIGRATE_COMMAND=${COMPOSE_COMMAND} run --rm migration -path ${DDL_DIR_ON_CONTAINER} -database "${DB_URL_FOR_MIGRATE}"
TBLS_COMMAND=${COMPOSE_COMMAND} run --rm tbls

.PHONY: migrate-help
migrate-help:
	@${MIGRATE_COMMAND} -help 

.PHONY: migrate-version
migrate-version:
	@${MIGRATE_COMMAND} version 

.PHONY: migrate-up
migrate-up:
	@${MIGRATE_COMMAND} up

.PHONY: migrate-up-one
migrate-up-one:
	@${MIGRATE_COMMAND} up 1

.PHONY: migrate-down-one
migrate-down-one:
	@${MIGRATE_COMMAND} down 1

.PHONY: migrate-force-v
migrate-force-v:
	@${MIGRATE_COMMAND} force ${v}

.PHONY: migrate-create
migrate-create:
	@${MIGRATE_COMMAND} create -ext sql -dir "${DDL_DIR_ON_CONTAINER}" -seq ${name}

.PHONY: tbls-doc
tbls-doc:
	@${TBLS_COMMAND} doc "${DB_URL_FOR_TBLS}" "${DB_DOC_DIR}" --rm-dist

.PHONY: tbls-lint
tbls-lint:
	@${TBLS_COMMAND} lint "${DB_URL_FOR_TBLS}"

.PHONY: tbls-diff
tbls-diff:
	@${TBLS_COMMAND} diff "${DB_URL_FOR_TBLS}" "${DB_DOC_DIR}"
