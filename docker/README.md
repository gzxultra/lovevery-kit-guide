# Lovevery Alternatives Scraper — Docker Deployment

This directory contains everything needed to run the Lovevery Amazon alternatives scraper as a Docker container on Unraid or any Docker-compatible system.

## 📦 What's Included

- **Dockerfile** — Optimized Python 3.11 image with all dependencies
- **docker-compose.yml** — Easy deployment configuration
- **entrypoint.sh** — Container startup script (clones repo, sets up cron)
- **run_scraper.sh** — Scraper execution script (scrapes + commits + pushes)
- **requirements.txt** — Python dependencies
- **.env.example** — Environment variable template

## 🚀 Quick Start

### 1. Set Up Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

Required variables:
- `OPENAI_API_KEY` — Your OpenAI API key
- `GITHUB_TOKEN` — GitHub Personal Access Token with `repo` scope

### 2. Build and Run

```bash
docker-compose up -d
```

### 3. View Logs

```bash
docker-compose logs -f
```

## 📋 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key for AI-powered search |
| `GITHUB_TOKEN` | Yes | - | GitHub PAT for pushing updates |
| `GITHUB_REPO` | No | `gzxultra/loveveryfans` | Repository in `owner/repo` format |
| `CRON_SCHEDULE` | No | `0 3 * * 1` | Cron expression (default: Mon 3 AM) |
| `RUN_ON_STARTUP` | No | `true` | Run scraper immediately on start |
| `TZ` | No | `America/Los_Angeles` | Timezone for cron |
| `SCRAPER_FLAGS` | No | `--update --verbose` | Flags passed to scraper |
| `GIT_USER_NAME` | No | `loveveryfans-bot` | Git commit author name |
| `GIT_USER_EMAIL` | No | `bot@loveveryfans.com` | Git commit author email |
| `GIT_BRANCH` | No | `main` | Git branch to push to |

\* *Not required if using `--refresh-prices` flag (price-only updates)*

### Scraper Flags

Common flag combinations:

- `--update --verbose` — Update existing data, add new products (default)
- `--refresh-prices --verbose` — Only refresh prices (no AI, no API key needed)
- `--kit looker --verbose` — Only scrape a specific kit
- `--stats` — Show detailed statistics (automatically added)

### Cron Schedule Examples

| Schedule | Description |
|----------|-------------|
| `0 3 * * 1` | Every Monday at 3:00 AM (default) |
| `0 2 * * *` | Every day at 2:00 AM |
| `0 4 * * 0,3` | Sunday and Wednesday at 4:00 AM |
| `0 */6 * * *` | Every 6 hours |
| `30 1 1 * *` | First day of month at 1:30 AM |

## 🏠 Unraid Deployment

See [UNRAID_DEPLOYMENT.md](./UNRAID_DEPLOYMENT.md) for detailed Unraid-specific instructions.

## 🔧 Management Commands

### View Logs
```bash
docker-compose logs -f
```

### Restart Container
```bash
docker-compose restart
```

### Stop Container
```bash
docker-compose down
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Run Scraper Manually (inside container)
```bash
docker exec -it lovevery-scraper /app/run_scraper.sh
```

### Access Container Shell
```bash
docker exec -it lovevery-scraper bash
```

## 📊 Monitoring

The container logs show:
- Startup information (timezone, schedule, flags)
- Scraper execution progress
- Git commit and push status
- Detailed statistics (success rate, failures, etc.)

Example log output:
```
[2026-02-18 03:00:00] ====== Scraper run started ======
[2026-02-18 03:00:01] Pulling latest changes from origin/main...
[2026-02-18 03:00:02] Running scraper with flags: --update --verbose
[2026-02-18 03:15:30] Scraper finished in 928 seconds.
[2026-02-18 03:15:31] Changes detected: 1 file changed, 50 insertions(+), 30 deletions(-)
[2026-02-18 03:15:32] Committed: chore: auto-update alternatives data (2026-02-18 03:15)
[2026-02-18 03:15:35] Push successful!
[2026-02-18 03:15:35] ====== Scraper run completed successfully ======
```

## 🔍 Troubleshooting

### Container won't start
- Check environment variables are set correctly
- Verify GitHub token has `repo` scope
- Check logs: `docker-compose logs`

### Scraper fails with "No module named 'requests'"
- Rebuild the image: `docker-compose up -d --build`

### Git push fails
- Verify GitHub token is valid and has push permissions
- Check if repository exists and token has access
- Look for "Push failed" in logs

### Low success rate
- Check Amazon isn't blocking your IP
- Try increasing delays in the script
- Consider running during off-peak hours (2-5 AM PST)
- Review statistics in logs for failure reasons

### Cron not running
- Check cron syntax is valid: https://crontab.guru
- Verify timezone is correct
- Check container health: `docker ps`

## 🎯 Best Practices

1. **Run during off-peak hours** — Less likely to trigger Amazon rate limits
2. **Use `--update` mode** — Preserves existing good data
3. **Monitor logs regularly** — Watch for patterns in failures
4. **Periodic price refresh** — Use `--refresh-prices` weekly (faster, no AI cost)
5. **Test with one kit first** — Use `--kit looker` to test changes
6. **Keep token secure** — Never commit `.env` file to git

## 📈 Performance

Typical scraping times (depends on number of products and network):
- Single kit (~20 toys): 5-10 minutes
- All kits (~200 toys): 60-90 minutes
- Price refresh only: 30-50% faster

Resource usage:
- Memory: ~128-256 MB (512 MB limit)
- CPU: Low (mostly waiting for network)
- Disk: ~50 MB (container + repo)

## 🔐 Security Notes

- GitHub token is stored in environment variables (not in code)
- Token is only accessible inside the container
- Use `.env` file (never commit to git)
- Tokens are passed via HTTPS to GitHub
- Consider using GitHub Actions secrets for CI/CD

## 📚 Additional Resources

- [Optimized Scraper Documentation](../scripts/SCRAPER_OPTIMIZATION.md)
- [Original Scraper README](../scripts/README.md)
- [Unraid Docker Documentation](https://wiki.unraid.net/Docker_Management)
- [Cron Expression Reference](https://crontab.guru)

## 🐛 Issues and Support

If you encounter issues:
1. Check the logs first: `docker-compose logs -f`
2. Review the troubleshooting section above
3. Check the scraper statistics for failure patterns
4. Open an issue on GitHub with logs and configuration (redact tokens!)

## 📝 License

Same as the main project.
