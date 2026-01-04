#!/bin/bash
set -euo pipefail

# Directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load Postgres admin credentials
set -a
source "$SCRIPT_DIR/../../postgres/.env"
set +a

# Load the new password for app user
set -a
source "$SCRIPT_DIR/.env"               # should define APP_PASSWORD
set +a

# Export password for psql
export PGPASSWORD="$POSTGRES_PASSWORD"

# Alter password for user 'app'
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  ALTER USER app WITH PASSWORD '${APP_PASSWORD}';
EOSQL

echo "Password for user 'app' updated successfully."
