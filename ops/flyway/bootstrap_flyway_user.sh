#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load Postgres admin credentials
set -a
source "$SCRIPT_DIR/../postgres/.postgres.env"
set +a

# Load Flyway password
set -a
source "$SCRIPT_DIR/.flyway.env"
set +a

export PGPASSWORD="$POSTGRES_PASSWORD"

psql \
  -h localhost \
  -p 5432 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --set=flyway_user_pwd="$FLYWAY_USER_PWD" \
<<-EOSQL
  CREATE ROLE flyway NOINHERIT LOGIN PASSWORD :'flyway_user_pwd';
  GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO flyway;
  GRANT USAGE, CREATE ON SCHEMA public TO flyway;
EOSQL
