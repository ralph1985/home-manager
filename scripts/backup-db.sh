#!/bin/sh
set -eu

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required for backup. Please install PostgreSQL client tools and try again." >&2
  exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/data/backups}"
DATABASE_URL="${DATABASE_URL:-postgresql://home_manager:home_manager@127.0.0.1:5432/home_manager?schema=public}"

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required for backup." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/postgres-$TIMESTAMP.dump"

pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"

if [ "${SKIP_ONEDRIVE_SYNC:-0}" -ne 1 ]; then
  SYNC_DIR="${ONEDRIVE_SYNC_DIR:-$ROOT_DIR/../onedrive-file-sync}"
  if [ -x "$SYNC_DIR/run.sh" ]; then
    REMOTE_DIR="${ONEDRIVE_REMOTE_DIR:-backups/home-manager/backups}"
    REMOTE_PATH="$REMOTE_DIR/$(basename "$BACKUP_FILE")"
    "$SYNC_DIR/run.sh" --local "$BACKUP_FILE" --remote "$REMOTE_PATH"
  else
    echo "OneDrive sync skipped: $SYNC_DIR/run.sh not found or not executable." >&2
  fi
fi
