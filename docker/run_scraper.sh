#!/bin/bash
# =============================================================================
# Lovevery Alternatives Scraper — Run & Push Script
#
# Called by cron or on startup. This script:
#   1. Pulls the latest code from GitHub
#   2. Runs the scraper with configured flags
#   3. Commits and pushes any data changes
# =============================================================================
set -euo pipefail

# Load environment if running from cron
if [ -f /app/env.sh ]; then
    set -a
    source /app/env.sh
    set +a
fi

REPO_DIR="/app/repo"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[${TIMESTAMP}] [scraper] $*"
}

log "====== Scraper run started ======"

# ---------------------------------------------------------------------------
# Pull latest changes
# ---------------------------------------------------------------------------
cd "$REPO_DIR"
log "Pulling latest changes from origin/${GIT_BRANCH}..."
git fetch origin "$GIT_BRANCH" 2>&1
git reset --hard "origin/$GIT_BRANCH" 2>&1
log "Repository updated."

# ---------------------------------------------------------------------------
# Run the scraper
# ---------------------------------------------------------------------------
log "Running scraper with flags: ${SCRAPER_FLAGS:-}"
SCRAPE_START=$(date +%s)

python3 scripts/scrape_alternatives_optimized.py ${SCRAPER_FLAGS:-} --stats || {
    log "ERROR: Scraper exited with non-zero status ($?)"
    log "====== Scraper run FAILED ======"
    exit 1
}

SCRAPE_END=$(date +%s)
SCRAPE_DURATION=$(( SCRAPE_END - SCRAPE_START ))
log "Scraper finished in ${SCRAPE_DURATION} seconds."

# ---------------------------------------------------------------------------
# Check for changes and push
# ---------------------------------------------------------------------------
log "Checking for data changes..."

# Stage the JSON data file
git add scripts/lovevery_alternatives.json

# Check if there are staged changes
if git diff --cached --quiet; then
    log "No data changes detected. Nothing to push."
else
    CHANGED_LINES=$(git diff --cached --stat | tail -1)
    log "Changes detected: ${CHANGED_LINES}"

    # Commit with descriptive message
    COMMIT_MSG="chore: auto-update alternatives data ($(date '+%Y-%m-%d %H:%M'))"
    git commit -m "$COMMIT_MSG" 2>&1
    log "Committed: ${COMMIT_MSG}"

    # Push with retry
    MAX_PUSH_RETRIES=3
    for i in $(seq 1 $MAX_PUSH_RETRIES); do
        log "Pushing to origin/${GIT_BRANCH} (attempt ${i}/${MAX_PUSH_RETRIES})..."
        if git push origin "$GIT_BRANCH" 2>&1; then
            log "Push successful!"
            break
        else
            if [ "$i" -eq "$MAX_PUSH_RETRIES" ]; then
                log "ERROR: Push failed after ${MAX_PUSH_RETRIES} attempts."
                exit 1
            fi
            log "Push failed, retrying in 10 seconds..."
            sleep 10
            # Re-fetch and rebase in case of conflicts
            git fetch origin "$GIT_BRANCH" 2>&1
            git rebase "origin/$GIT_BRANCH" 2>&1 || {
                log "Rebase failed, aborting..."
                git rebase --abort 2>&1
                exit 1
            }
        fi
    done
fi

log "====== Scraper run completed successfully ======"
