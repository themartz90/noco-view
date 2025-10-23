#!/usr/bin/env bash

# Docker Volume Backup script for NocoDB Mood Diary Viewer
# Designed for Linux Mint server in ~/Docker/ structure
# Usage: ./backup.sh

set -euo pipefail

# Configuration
PROJECT_NAME="${PROJECT_NAME:-noco-view}"
BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
VOLUME_NAME="${VOLUME_NAME:-noco-view_mood_data}"
CONTAINER_NAME="${CONTAINER_NAME:-noco-view}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

log() {
  printf '[backup] %s\n' "$1"
}

abort() {
  printf '[backup] ERROR: %s\n' "$1" >&2
  exit 1
}

# Check if Docker is available
command -v docker >/dev/null 2>&1 || abort "Docker CLI not available."

# Check if Docker Compose is available
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  abort "Docker Compose is not installed."
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/${TIMESTAMP}_mood_volume.tar.gz"

log "Starting Docker volume backup of '${VOLUME_NAME}'..."

# Check if volume exists
if ! docker volume inspect "${VOLUME_NAME}" >/dev/null 2>&1; then
  log "⚠️  Volume '${VOLUME_NAME}' does not exist yet. Skipping backup."
  log "💡 This is normal for first deployment before any data is created."
  exit 0
fi

# Stop the container for consistent backup
log "Stopping container '${CONTAINER_NAME}' for consistent backup..."
"${COMPOSE[@]}" stop || abort "Failed to stop container."

# Create backup using a temporary container
log "Creating volume backup: ${BACKUP_FILE}"
docker run --rm \
  -v "${VOLUME_NAME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine:latest \
  tar czf "/backup/$(basename "${BACKUP_FILE}")" -C /data . \
  || abort "Failed to create backup."

# Restart the container
log "Restarting container..."
"${COMPOSE[@]}" start || abort "Failed to restart container."

# Verify backup was created
if [[ -f "${BACKUP_FILE}" ]]; then
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  log "✅ Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  abort "Backup file was not created."
fi

# Clean up old backups
log "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*_mood_volume.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete || log "Warning: Failed to clean up old backups."

# Show current backups
log "📊 Current backups:"
ls -lah "${BACKUP_DIR}"/*_mood_volume.tar.gz 2>/dev/null || log "No backups found."

log "💡 Backup location: ${BACKUP_DIR}/"
log "📁 Total backups: $(ls "${BACKUP_DIR}"/*_mood_volume.tar.gz 2>/dev/null | wc -l)"

log "🎉 Backup process completed successfully!"
