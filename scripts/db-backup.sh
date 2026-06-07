#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/db-backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/cabinet-gyneco_${TIMESTAMP}.sql.gz"

echo "Dumping database to ${BACKUP_FILE}..."
pg_dump "$DATABASE_URL" --no-owner --clean | gzip > "$BACKUP_FILE"

echo "Backup complete: ${BACKUP_FILE}"
echo "backup_file=${BACKUP_FILE}" >> "$GITHUB_OUTPUT"
