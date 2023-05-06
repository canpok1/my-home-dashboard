include .env

COMPOSE_FILE_PATH=docker-compose-development.yaml
DB_URL=mysql://${DB_USER}:${DB_PASSWORD}@tcp(${DB_HOST_ON_DOCKER_NETWORK}:${DB_PORT_ON_DOCKER_NETWORK})/${DB_NAME}
MIGRATE_COMMAND=docker compose -f ${COMPOSE_FILE_PATH} run --rm migration -path ${DDL_DIR_ON_CONTAINER} -database "${DB_URL}"

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
