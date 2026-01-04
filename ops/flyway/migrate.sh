#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load Postgres admin credentials
set -a
source "$SCRIPT_DIR/../postgres/.env"
set +a

# Load Flyway password
set -a
source "$SCRIPT_DIR/.env"
set +a

# Create flyway user if not exists
export PGPASSWORD="$POSTGRES_PASSWORD"
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
<<-EOSQL
  -- Create the flyway role if it doesn't exist
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'flyway') THEN
      CREATE ROLE flyway LOGIN NOINHERIT CREATEROLE;
    END IF;
  END
  \$\$;

  -- Always update the password
  ALTER ROLE flyway WITH PASSWORD '${FLYWAY_PASSWORD}';

  -- Grant basic database access
  GRANT CONNECT ON DATABASE $POSTGRES_DB TO flyway;
  GRANT CREATE ON DATABASE $POSTGRES_DB TO flyway;

  CREATE SCHEMA IF NOT EXISTS flyway;
  GRANT USAGE, CREATE ON SCHEMA flyway TO flyway;
EOSQL

# Run Flyway migrations
docker run --rm \
  --network endeavor_default \
  --env-file .env \
  -e FLYWAY_URL=jdbc:postgresql://postgres:$POSTGRES_PORT/$POSTGRES_DB \
  -e FLYWAY_SCHEMAS=flyway \
  -v "$PWD/migrations:/flyway/sql" \
  flyway/flyway:11-alpine migrate