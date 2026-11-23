#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

LOCK_FILE="/tmp/visage-deploy.lock"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "ERROR: another deployment is already running" >&2
  exit 1
fi

LOG_DIR="$ROOT_DIR/backups/deploy"
mkdir -p "$LOG_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/deploy-$STAMP.log"
exec > >(tee -a "$LOG_FILE") 2>&1

cleanup() {
  if [[ "${ROLLBACK_NEEDED:-0}" == "1" ]]; then
    echo "Rolling back containers to pre-deploy images..."
    docker tag visage_site-backend:predeploy-$STAMP visage_site-backend:latest >/dev/null 2>&1 || true
    docker tag visage_site-frontend:predeploy-$STAMP visage_site-frontend:latest >/dev/null 2>&1 || true
    docker compose up -d --no-build --no-deps backend frontend nginx || true
  fi
}
trap cleanup EXIT

command -v docker >/dev/null
command -v flock >/dev/null

echo "Deployment started: $STAMP"
echo "Fetching origin/master..."
git fetch --prune origin master
git pull --ff-only origin master
TARGET_COMMIT="$(git rev-parse --short HEAD)"
echo "Target commit: $TARGET_COMMIT"

if [[ ! -f .env ]]; then
  echo "ERROR: .env is missing" >&2
  exit 1
fi

BACKEND_IMAGE="$(docker compose images -q backend 2>/dev/null || true)"
FRONTEND_IMAGE="$(docker compose images -q frontend 2>/dev/null || true)"

if [[ -n "$BACKEND_IMAGE" ]]; then
  docker tag "$BACKEND_IMAGE" "visage_site-backend:predeploy-$STAMP"
fi
if [[ -n "$FRONTEND_IMAGE" ]]; then
  docker tag "$FRONTEND_IMAGE" "visage_site-frontend:predeploy-$STAMP"
fi

mkdir -p backups
BACKUP_FILE="backups/pre-deploy-$STAMP.dump"
echo "Creating database backup: $BACKUP_FILE"
docker exec makeup_postgres pg_dump \
  -U "$(docker exec makeup_postgres printenv POSTGRES_USER)" \
  -d "$(docker exec makeup_postgres printenv POSTGRES_DB)" \
  -Fc --no-owner --no-acl > "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "ERROR: database backup is empty" >&2
  exit 1
fi

ROLLBACK_NEEDED=1

echo "Building backend and frontend..."
docker compose build --pull backend frontend

echo "Migrating database while old application remains available..."
docker compose up -d postgres
for attempt in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U "$(docker compose exec -T postgres printenv POSTGRES_USER)" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
docker compose run --rm --no-deps backend alembic upgrade head

echo "Replacing backend and frontend containers..."
docker compose up -d --no-deps --remove-orphans backend frontend

echo "Waiting for application health..."
HEALTH_OK=0
for attempt in $(seq 1 60); do
  if docker compose exec -T backend python -c 'import urllib.request; urllib.request.urlopen("http://127.0.0.1:8000/", timeout=2).read()' >/dev/null 2>&1 \
     && curl -fsS --max-time 3 http://127.0.0.1/ >/dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi
  sleep 2
done

if [[ "$HEALTH_OK" != "1" ]]; then
  echo "ERROR: application health check failed" >&2
  docker compose ps
  docker compose logs --tail=100 backend frontend nginx || true
  exit 1
fi

ROLLBACK_NEEDED=0
trap - EXIT

echo "Deployment completed: $TARGET_COMMIT"
echo "Log: $LOG_FILE"
