#!/bin/sh
set -eu

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required for backup. Please install it and try again." >&2
  exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DB_PATH="${DB_PATH:-$ROOT_DIR/data/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/data/backups}"

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dev-$TIMESTAMP.db"

sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

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
