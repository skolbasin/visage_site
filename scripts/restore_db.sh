#!/usr/bin/env bash
# Restore PostgreSQL from a custom-format dump created by backup_db.sh.
#
# WARNING: replaces the current database contents.
#
# Usage (on server):
#   cd /opt/visage_site
#   ./scripts/restore_db.sh backups/makeup_db_2026-09-01.dump

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <path-to.dump>" >&2
  exit 1
fi

DUMP_FILE="$1"
CONTAINER="${POSTGRES_CONTAINER:-makeup_postgres}"

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: dump not found: $DUMP_FILE" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: container '$CONTAINER' is not running" >&2
  exit 1
fi

POSTGRES_USER="$(docker exec "$CONTAINER" printenv POSTGRES_USER)"
POSTGRES_DB="$(docker exec "$CONTAINER" printenv POSTGRES_DB)"
POSTGRES_PASSWORD="$(docker exec "$CONTAINER" printenv POSTGRES_PASSWORD)"

if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_DB" ]]; then
  echo "ERROR: POSTGRES_USER / POSTGRES_DB not set in container" >&2
  exit 1
fi

echo "About to RESTORE into database '$POSTGRES_DB' from:"
echo "  $DUMP_FILE"
echo
read -r -p "Type YES to continue: " CONFIRM
if [[ "$CONFIRM" != "YES" ]]; then
  echo "Aborted."
  exit 1
fi

echo "Restoring..."
# --clean drops objects before recreate; --if-exists avoids errors on empty DB
docker exec -i -e PGPASSWORD="$POSTGRES_PASSWORD" "$CONTAINER" pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  < "$DUMP_FILE"

echo "OK: restore finished. Restart backend to clear connections if needed:"
echo "  docker compose restart backend"
