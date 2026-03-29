#!/bin/sh
set -eu

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required for snapshot. Please install PostgreSQL client tools and try again." >&2
  exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SNAPSHOT_DIR="${SNAPSHOT_DIR:-$ROOT_DIR/data/snapshots}"
DATABASE_URL="${DATABASE_URL:-postgresql://home_manager:home_manager@127.0.0.1:5432/home_manager?schema=public}"

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required for snapshot." >&2
  exit 1
fi

mkdir -p "$SNAPSHOT_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LABEL_RAW="${1:-}"
LABEL=""

if [ -n "$LABEL_RAW" ]; then
  LABEL_CLEAN=$(printf '%s' "$LABEL_RAW" | tr -cs 'A-Za-z0-9._-' '-' | sed 's/^-//;s/-$//')
  if [ -n "$LABEL_CLEAN" ]; then
    LABEL="-$LABEL_CLEAN"
  fi
fi

SNAPSHOT_FILE="$SNAPSHOT_DIR/postgres-$TIMESTAMP$LABEL.sql"
pg_dump "$DATABASE_URL" --no-owner --no-privileges --file="$SNAPSHOT_FILE"

echo "Snapshot created: $SNAPSHOT_FILE"

if [ "${SKIP_ONEDRIVE_SYNC:-0}" -ne 1 ]; then
  SYNC_DIR="${ONEDRIVE_SYNC_DIR:-$ROOT_DIR/../onedrive-file-sync}"
  if [ -x "$SYNC_DIR/run.sh" ]; then
    REMOTE_DIR="${ONEDRIVE_REMOTE_DIR:-backups/home-manager/snapshots}"
    REMOTE_PATH="$REMOTE_DIR/$(basename "$SNAPSHOT_FILE")"
    "$SYNC_DIR/run.sh" --local "$SNAPSHOT_FILE" --remote "$REMOTE_PATH"
  else
    echo "OneDrive sync skipped: $SYNC_DIR/run.sh not found or not executable." >&2
  fi
fi
