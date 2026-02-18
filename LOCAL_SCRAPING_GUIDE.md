# Local Scraping Guide

> **Recommended workflow:** Run the scraper on your own machine, commit the
> updated JSON, and let GitHub Actions handle the build and deployment
> automatically.

---

## Prerequisites

| Requirement | Version | Check command |
|---|---|---|
| Python | 3.9+ | `python3 --version` |
| pip | any | `pip3 --version` |
| Git | any | `git --version` |
| OpenAI API key | — | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

## 1. Install Python Dependencies

```bash
pip3 install -r scripts/requirements.txt
```

This installs `requests`, `beautifulsoup4`, `lxml`, and `openai`.

## 2. Export Your OpenAI API Key

**macOS / Linux:**

```bash
export OPENAI_API_KEY="sk-..."
```

**Windows PowerShell:**

```powershell
$env:OPENAI_API_KEY = "sk-..."
```

> The API key is only needed when searching for *new* alternatives. If you
> only want to refresh prices and ratings for products that are already in
> the JSON, use the `--refresh-prices` flag (no API key required).

## 3. Run the Scraper

```bash
# From the repository root
cd scripts

# Update existing data (recommended — preserves what you already have)
python3 scrape_alternatives.py --update --verbose

# Or refresh only prices/ratings (no OpenAI calls, faster)
python3 scrape_alternatives.py --refresh-prices --verbose

# Or scrape a single kit
python3 scrape_alternatives.py --kit looker --update --verbose
```

The script writes its output to `scripts/lovevery_alternatives.json`.

### Useful flags

| Flag | Purpose |
|---|---|
| `--update` | Merge new results into existing JSON instead of overwriting |
| `--refresh-prices` | Re-scrape Amazon prices/ratings for existing ASINs (no AI) |
| `--kit <id>` | Process only one kit (e.g. `looker`, `senser`) |
| `--output <path>` | Write to a custom file path |
| `--verbose` | Print detailed progress |

## 4. Commit and Push

```bash
git add scripts/lovevery_alternatives.json
git commit -m "Update alternatives data"
git push origin main
```

Pushing to `main` automatically triggers the **Build and Deploy** GitHub
Actions workflow, which rebuilds the frontend with the new data and deploys
it to GitHub Pages.

## 5. Monitor the Deployment

Go to your repository's **Actions** tab on GitHub to watch the workflow run.
Once it completes, the updated site will be live at
[loveveryfans.com](https://loveveryfans.com).

---

## Troubleshooting

**Amazon returns 503 / blocks requests:**
Amazon rate-limits aggressive scraping. The script already includes random
delays (2–4 seconds between requests), but if you are still getting blocked,
try again after a few minutes or use a VPN.

**OpenAI API errors:**
Make sure your `OPENAI_API_KEY` is valid and has sufficient credits. The
script uses the `gpt-4.1-mini` model.

**No data changes after running:**
If you use `--update` and the script finds no new alternatives, the JSON
file will remain unchanged. This is expected.
