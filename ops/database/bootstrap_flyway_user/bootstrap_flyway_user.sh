#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load Postgres admin credentials
set -a
source "$SCRIPT_DIR/../../docker-compose/.env"
set +a

# Load Flyway password
set -a
source "$SCRIPT_DIR/.env"
set +a

export PGPASSWORD="$POSTGRES_PASSWORD"

psql \
  -h localhost \
  -p 5432 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --set=flyway_user_pwd="$FLYWAY_USER_PWD" \
<<-EOSQL
  CREATE ROLE flyway LOGIN PASSWORD :'flyway_user_pwd';
  GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO flyway;
  GRANT USAGE, CREATE ON SCHEMA public TO flyway;
EOSQL
