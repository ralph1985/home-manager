#!/bin/sh
set -eu

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required for snapshot. Please install it and try again." >&2
  exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DB_PATH="${DB_PATH:-$ROOT_DIR/data/dev.db}"
SNAPSHOT_DIR="${SNAPSHOT_DIR:-$ROOT_DIR/data/snapshots}"

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH" >&2
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

SNAPSHOT_FILE="$SNAPSHOT_DIR/dev-$TIMESTAMP$LABEL.sql"
sqlite3 "$DB_PATH" ".dump" > "$SNAPSHOT_FILE"

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
