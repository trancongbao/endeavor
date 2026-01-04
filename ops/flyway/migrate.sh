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

# Create flyway user everytime to ensure clean state
export PGPASSWORD="$POSTGRES_PASSWORD"
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
<<-EOSQL
DO \$\$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'flyway') THEN
    RAISE NOTICE 'Dropping existing flyway role';
    REASSIGN OWNED BY flyway TO CURRENT_USER;
    DROP OWNED BY flyway;
    DROP ROLE flyway;
  END IF;

  RAISE NOTICE 'Creating flyway role';
  EXECUTE format(
    'CREATE ROLE %I LOGIN PASSWORD %L NOINHERIT CREATEROLE',
    'flyway',
    '${FLYWAY_PASSWORD}'
  );

  -- Grant basic database access
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'flyway');
  EXECUTE format('GRANT USAGE, CREATE ON SCHEMA public TO %I', 'flyway');
END
\$\$;
EOSQL

# Run Flyway migrations
docker run --rm \
  --network endeavor_default \
  --env-file .env \
  -e FLYWAY_URL=jdbc:postgresql://postgres:5432/$POSTGRES_DB \
  -v "$PWD/migrations:/flyway/sql" \
  flyway/flyway:11-alpine migrate