DB_URL_FOR_MIGRATE=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@tcp(${MYSQL_HOST}:${MYSQL_PORT})/${MYSQL_DATABASE}
DB_URL_FOR_TBLS=mariadb://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}
DB_DDL_DIR=./ddl
DB_DOC_DIR=../../public/database

MIGRATE_COMMAND=migrate -path ${DB_DDL_DIR} -database "${DB_URL_FOR_MIGRATE}"
TBLS_COMMAND=tbls

.PHONY: migrate
migrate:
	@${MIGRATE_COMMAND} ${options} ${v}

.PHONY: migrate-create
migrate-create:
	@${MIGRATE_COMMAND} create -ext sql -dir "${DB_DDL_DIR}" -seq ${name}

.PHONY: doc
doc:
	@${TBLS_COMMAND} doc "${DB_URL_FOR_TBLS}" "${DB_DOC_DIR}" --rm-dist

.PHONY: lint
lint:
	@${TBLS_COMMAND} lint "${DB_URL_FOR_TBLS}"

.PHONY: diff
diff:
	@${TBLS_COMMAND} diff "${DB_URL_FOR_TBLS}" "${DB_DOC_DIR}"
