# =============================================================================
# Lovevery Alternatives Scraper — Docker Image
# Optimized for Unraid home server deployment
# =============================================================================
FROM python:3.11-slim AS base

# Metadata
LABEL maintainer="loveveryfans"
LABEL description="Lovevery Play Kit Amazon Alternatives Scraper"
LABEL version="1.0"

# Prevent Python from writing .pyc files and enable unbuffered output for logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (git for push, cron for scheduling, tzdata for timezone)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        cron \
        tzdata \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && \
    rm /tmp/requirements.txt

# Create working directory
WORKDIR /app

# Copy entrypoint and helper scripts
COPY entrypoint.sh /app/entrypoint.sh
COPY run_scraper.sh /app/run_scraper.sh
RUN chmod +x /app/entrypoint.sh /app/run_scraper.sh

# Default environment variables
ENV CRON_SCHEDULE="0 3 * * 1" \
    SCRAPER_FLAGS="--update --verbose" \
    GIT_USER_NAME="loveveryfans-bot" \
    GIT_USER_EMAIL="bot@loveveryfans.com" \
    GIT_BRANCH="main" \
    TZ="America/Los_Angeles" \
    RUN_ON_STARTUP="true"

# Health check — verify the cron process is running
HEALTHCHECK --interval=60s --timeout=10s --retries=3 \
    CMD pgrep cron > /dev/null || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
