#!/usr/bin/env bash

set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-noco-view}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${DEPLOY_PROJECT_DIR:-$SCRIPT_DIR}"
DEFAULT_BRANCH="${DEPLOY_BRANCH:-master}"
WAIT_FOR_HEALTH="${WAIT_FOR_HEALTH:-45}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://localhost:3448/api/health}"
COMPOSE_SERVICE="${COMPOSE_SERVICE:-noco-view}"

log() {
  printf '[deploy] %s\n' "$1"
}

abort() {
  printf '[deploy] ERROR: %s\n' "$1" >&2
  exit 1
}

log "Starting deployment for ${PROJECT_NAME}..."

[[ -d "${PROJECT_DIR}" ]] || abort "Project directory '${PROJECT_DIR}' not found."
cd "${PROJECT_DIR}"

[[ -f docker-compose.yml ]] || abort "docker-compose.yml not found in '${PROJECT_DIR}'."

# Run backup before deployment
if [[ -f "${PROJECT_DIR}/backup.sh" ]]; then
  log "Running backup before deployment..."
  bash "${PROJECT_DIR}/backup.sh" || log "⚠️  Backup failed or skipped, continuing deployment..."
else
  log "⚠️  backup.sh not found, skipping backup."
fi

command -v docker >/dev/null 2>&1 || abort "Docker CLI not available. Install Docker and retry."

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  abort "Docker Compose is not installed. Install 'docker compose' or 'docker-compose'."
fi

if command -v git >/dev/null 2>&1; then
  log "Fetching latest code from origin/${DEFAULT_BRANCH}..."
  git fetch origin || abort "Failed to fetch from origin."
  if git show-ref --verify --quiet "refs/heads/${DEFAULT_BRANCH}"; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "${CURRENT_BRANCH}" != "${DEFAULT_BRANCH}" ]]; then
      log "Checking out ${DEFAULT_BRANCH}..."
      git checkout "${DEFAULT_BRANCH}" || abort "Unable to checkout ${DEFAULT_BRANCH}."
    fi
    git pull --ff-only origin "${DEFAULT_BRANCH}" || abort "Unable to fast-forward origin/${DEFAULT_BRANCH}."
  else
    log "Branch ${DEFAULT_BRANCH} not found locally; skipping checkout."
  fi
else
  log "Git not available; skipping repository update."
fi

log "Stopping running containers..."
"${COMPOSE[@]}" down || abort "Failed to stop containers."

log "Pruning unused Docker images..."
docker image prune -f >/dev/null || log "Image prune skipped."

log "Building and starting containers..."
"${COMPOSE[@]}" up --build -d || abort "docker compose up failed."

log "Waiting ${WAIT_FOR_HEALTH}s for services to become healthy..."
sleep "${WAIT_FOR_HEALTH}"

log "Checking application health at ${HEALTHCHECK_URL}..."
if curl -fsS "${HEALTHCHECK_URL}" >/dev/null; then
  log "Deployment successful. Application is healthy."
  log "Recent logs:"
  "${COMPOSE[@]}" logs --tail=10 "${COMPOSE_SERVICE}" || log "Unable to read service logs."
else
  log "Health check failed. Showing recent logs:"
  "${COMPOSE[@]}" logs --tail=20 "${COMPOSE_SERVICE}" || log "Unable to read service logs."
  abort "Health check did not succeed."
fi

log "Container status:"
"${COMPOSE[@]}" ps

log "✅ Deployment complete! Application available at http://localhost:3448"
