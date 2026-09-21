#!/usr/bin/env bash
# Monthly PostgreSQL backup for visage_site.
# Usage (on server):
#   cd /opt/visage_site && ./scripts/backup_db.sh
#
# Restore:
#   ./scripts/restore_db.sh backups/makeup_db_YYYY-MM-DD.dump

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
KEEP_COUNT="${KEEP_COUNT:-12}"
CONTAINER="${POSTGRES_CONTAINER:-makeup_postgres}"

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

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y-%m-%d)"
OUT_FILE="$BACKUP_DIR/${POSTGRES_DB}_${STAMP}.dump"

echo "Creating backup: $OUT_FILE"
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$CONTAINER" pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -Fc \
  --no-owner \
  --no-acl \
  > "$OUT_FILE"

SIZE="$(du -h "$OUT_FILE" | awk '{print $1}')"
echo "OK: $OUT_FILE ($SIZE)"

# Keep only the newest KEEP_COUNT dumps
mapfile -t OLD_FILES < <(ls -1t "$BACKUP_DIR"/"${POSTGRES_DB}"_*.dump 2>/dev/null | tail -n +"$((KEEP_COUNT + 1))" || true)
if ((${#OLD_FILES[@]} > 0)); then
  echo "Rotating: removing ${#OLD_FILES[@]} old backup(s)"
  rm -f "${OLD_FILES[@]}"
fi

echo "Kept backups:"
ls -lh "$BACKUP_DIR"/"${POSTGRES_DB}"_*.dump 2>/dev/null || true
