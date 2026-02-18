#!/bin/bash
# =============================================================================
# Lovevery Alternatives Scraper — Container Entrypoint
#
# This script:
#   1. Clones (or updates) the GitHub repository
#   2. Configures git credentials for push
#   3. Optionally runs the scraper immediately on startup
#   4. Sets up a cron job for scheduled execution
#   5. Tails the cron log so Docker logs show output
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
LOG_FILE="/var/log/scraper.log"
touch "$LOG_FILE"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=============================================="
log "Lovevery Alternatives Scraper — Starting"
log "=============================================="
log "Timezone      : ${TZ}"
log "Cron schedule : ${CRON_SCHEDULE}"
log "Scraper flags : ${SCRAPER_FLAGS}"
log "Git branch    : ${GIT_BRANCH}"
log "Run on startup: ${RUN_ON_STARTUP}"

# ---------------------------------------------------------------------------
# Validate required environment variables
# ---------------------------------------------------------------------------
if [ -z "${OPENAI_API_KEY:-}" ]; then
    log "WARNING: OPENAI_API_KEY is not set. AI-powered search will be disabled."
    log "         The scraper can still run with --refresh-prices flag."
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
    log "ERROR: GITHUB_TOKEN is required to push updates to GitHub."
    log "       Please set the GITHUB_TOKEN environment variable."
    exit 1
fi

if [ -z "${GITHUB_REPO:-}" ]; then
    log "ERROR: GITHUB_REPO is required (e.g., gzxultra/loveveryfans)."
    exit 1
fi

# ---------------------------------------------------------------------------
# Clone or update the repository
# ---------------------------------------------------------------------------
REPO_DIR="/app/repo"

if [ -d "$REPO_DIR/.git" ]; then
    log "Repository already exists, pulling latest changes..."
    cd "$REPO_DIR"
    git fetch origin "$GIT_BRANCH" 2>&1 | tee -a "$LOG_FILE"
    git reset --hard "origin/$GIT_BRANCH" 2>&1 | tee -a "$LOG_FILE"
else
    log "Cloning repository: ${GITHUB_REPO}..."
    git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git" \
        --branch "$GIT_BRANCH" --single-branch "$REPO_DIR" 2>&1 | tee -a "$LOG_FILE"
fi

cd "$REPO_DIR"

# Configure git identity
git config user.name  "${GIT_USER_NAME}"
git config user.email "${GIT_USER_EMAIL}"

# Ensure the remote URL includes the token (for push)
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

log "Repository ready at ${REPO_DIR}"

# ---------------------------------------------------------------------------
# Run scraper on startup (if enabled)
# ---------------------------------------------------------------------------
if [ "${RUN_ON_STARTUP}" = "true" ]; then
    log "Running scraper on startup..."
    /app/run_scraper.sh 2>&1 | tee -a "$LOG_FILE"
    log "Startup scrape completed."
else
    log "Skipping startup scrape (RUN_ON_STARTUP=false)."
fi

# ---------------------------------------------------------------------------
# Set up cron job
# ---------------------------------------------------------------------------
log "Setting up cron schedule: ${CRON_SCHEDULE}"

# Export all environment variables for cron
printenv | grep -E '^(OPENAI_API_KEY|GITHUB_TOKEN|GITHUB_REPO|GIT_USER_NAME|GIT_USER_EMAIL|GIT_BRANCH|SCRAPER_FLAGS|TZ|PATH|HOME|PYTHONUNBUFFERED|PYTHONDONTWRITEBYTECODE)=' \
    > /app/env.sh

# Create cron job file
cat > /etc/cron.d/scraper-cron <<EOF
# Lovevery Alternatives Scraper — Cron Job
SHELL=/bin/bash
${CRON_SCHEDULE} root /bin/bash -c 'source /app/env.sh && /app/run_scraper.sh >> /var/log/scraper.log 2>&1'
# Empty line required by cron
EOF

chmod 0644 /etc/cron.d/scraper-cron
crontab /etc/cron.d/scraper-cron

log "Cron job installed. Next run will follow schedule: ${CRON_SCHEDULE}"
log "Container is running. Tailing log file..."
log "=============================================="

# Start cron daemon and tail the log
cron
exec tail -f "$LOG_FILE"
