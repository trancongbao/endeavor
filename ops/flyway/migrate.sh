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

# Create flyway user if it does not exist
export PGPASSWORD="$POSTGRES_PASSWORD"
psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
<<-EOSQL  
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'flyway') THEN
      CREATE ROLE flyway LOGIN NOINHERIT PASSWORD '${FLYWAY_USER_PWD}';
    END IF;
  END
  \$\$;

  ALTER ROLE flyway
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS;

  GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO flyway;
  GRANT USAGE, CREATE ON SCHEMA public TO flyway;
EOSQL

# Run Flyway migrations
docker run --rm \
  --network endeavor_default \
  --env-file ops/flyway/.flyway.env \
  -e FLYWAY_URL=jdbc:postgresql://postgres:5432/$POSTGRES_DB \
  -v "$PWD/ops/flyway/migrations:/flyway/sql" \
  flyway/flyway migrate