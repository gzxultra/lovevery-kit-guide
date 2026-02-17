# Lovevery Kit Guide — Data Collection Scripts

This directory contains a set of reusable Python scripts for collecting, processing, and transforming data used by the [Lovevery Fans](https://loveveryfans.com/) website.

## Overview

| Script | Purpose | Output |
|--------|---------|--------|
| `scrape_lovevery_official.py` | Scrape Kit & Toy data from lovevery.com | `lovevery_kits.json` |
| `scrape_alternatives.py` | Find and update Amazon alternative products | `lovevery_alternatives.json` |
| `scrape_reviews.py` | Collect parent reviews from Reddit, Amazon, Xiaohongshu | `lovevery_reviews.json` |
| `scrape_cleaning_guide.py` | Collect cleaning instructions by material type | `lovevery_cleaning_guide.json` |
| `generate_toy_data.py` | Convert JSON → TypeScript data files for the website | `*.ts` files |

## Data Pipeline

```
┌─────────────────────────┐
│  scrape_lovevery_       │──→ lovevery_kits.json
│  official.py            │
└─────────────────────────┘
                                    │
┌─────────────────────────┐         ▼
│  scrape_reviews.py      │──→ lovevery_reviews.json
└─────────────────────────┘         │
                                    ▼
┌─────────────────────────┐  ┌──────────────────┐
│  scrape_cleaning_       │──│ generate_toy_     │──→ client/src/data/*.ts
│  guide.py               │  │ data.py           │
└─────────────────────────┘  └──────────────────┘
```

## Setup

### Prerequisites

- Python 3.9+
- pip

### Install Dependencies

```bash
cd scripts/
pip install -r requirements.txt
```

### Optional: OpenAI API Key

Some scripts support LLM-powered features (review summarisation, material identification). To use these features, set the `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY="sk-..."
```

## Script Details

---

### 1. `scrape_lovevery_official.py`

Scrapes the Lovevery official website for Kit and Toy product data, including names, descriptions, images (Contentful CDN URLs), and pricing.

#### Usage

```bash
# Scrape all 22 kits
python scrape_lovevery_official.py

# Scrape specific kits only
python scrape_lovevery_official.py --kit looker charmer senser

# Custom output path
python scrape_lovevery_official.py -o data/kits.json

# Slower request rate (be polite to the server)
python scrape_lovevery_official.py --delay 2.0

# Verbose debug logging
python scrape_lovevery_official.py -v
```

#### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--kit SLUG [SLUG ...]` | all 22 kits | Kit slug(s) to scrape |
| `-o, --output PATH` | `lovevery_kits.json` | Output JSON file path |
| `--delay SECONDS` | `1.5` | Delay between HTTP requests |
| `-v, --verbose` | off | Enable debug logging |

#### Output Format

```json
[
  {
    "slug": "looker",
    "title": "The Looker Play Kit | Lovevery",
    "description": "Weeks 0-12. Designed by experts...",
    "og_image": "https://images.ctfassets.net/...",
    "price": "80.00",
    "currency": "USD",
    "images": ["https://images.ctfassets.net/..."],
    "toys": [
      {
        "name": "Black and White Cards",
        "description": "High-contrast cards for...",
        "image": "https://images.ctfassets.net/..."
      }
    ],
    "url": "https://lovevery.com/products/the-play-kits-the-looker"
  }
]
```

#### Valid Kit Slugs

`looker`, `charmer`, `senser`, `explorer`, `observer`, `thinker`, `babbler`, `pioneer`, `realist`, `analyst`, `companion`, `free-spirit`, `helper`, `enthusiast`, `planner`, `adventurer`, `persister`, `challenger`, `investigator`, `examiner`, `connector`, `creative`

---

### 2. `scrape_alternatives.py`

Finds affordable Amazon alternatives for Lovevery toys using AI-powered search, then scrapes real product data (prices, ratings, reviews, images) from Amazon.

#### Features

- 🤖 **AI-Powered Discovery**: Uses OpenAI GPT-4 to find relevant Amazon products
- 🌐 **Real Data Scraping**: Fetches actual prices, ratings, reviews, and images from Amazon
- 🔄 **Incremental Updates**: Refresh existing products without AI search
- 🛡️ **Anti-Blocking**: Random delays, retries, proper headers to avoid detection
- 📊 **Progress Tracking**: Detailed verbose output for monitoring

#### Usage

```bash
# Refresh prices/ratings/images for all existing products (no AI needed)
python scrape_alternatives.py --refresh-prices --verbose

# Update a specific kit only
python scrape_alternatives.py --refresh-prices --kit looker --verbose

# Find new alternatives with AI (requires OPENAI_API_KEY)
python scrape_alternatives.py --verbose

# Update mode (merge with existing data)
python scrape_alternatives.py --update --verbose
```

#### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--refresh-prices` | off | Refresh prices/ratings for existing ASINs (no AI search) |
| `--kit KIT_ID` | all kits | Process only a specific kit (e.g., `looker`, `charmer`) |
| `--update` | off | Update mode - merge with existing data |
| `-o, --output PATH` | `lovevery_alternatives.json` | Output JSON file path |
| `-v, --verbose` | off | Enable detailed progress logging |

#### Output Format

```json
[
  {
    "kitId": "looker",
    "kitName": "The Looker",
    "toys": [
      {
        "toyName": "The Mobile",
        "toyNameCn": "床铃",
        "alternatives": [
          {
            "name": "Montessori Mobile Baby for Crib",
            "asin": "B088TCNZ52",
            "price": "$25.99",
            "rating": 4.4,
            "reviewCount": 1580,
            "imageUrl": "https://m.media-amazon.com/images/I/...",
            "amazonUrl": "https://www.amazon.com/dp/B088TCNZ52?tag=loveveryfans-20",
            "reasonEn": "High-contrast mobile designed for newborns...",
            "reasonCn": "高对比度床铃，专为新生儿设计..."
          }
        ]
      }
    ]
  }
]
```

#### Anti-Blocking Strategy

- **Realistic Headers**: Full browser-like headers including Sec-Fetch-*
- **Random Delays**: 2-4 seconds between requests
- **Retry Logic**: Up to 3 attempts with exponential backoff
- **Rate Limiting**: Special handling for 503 errors (10s wait)

#### Automation

Runs automatically via GitHub Actions:
- **Schedule**: Daily at 6:00 AM UTC (10:00 PM PST)
- **Workflow**: `.github/workflows/update-alternatives.yml`
- **Action**: Refreshes all product data and auto-deploys if changed

#### Notes

- Price refresh does NOT require OpenAI API key (only for finding new products)
- Some ASINs may return 404 (discontinued products)
- Full update takes approximately 10-15 minutes for all 174 products
- Affiliate tag `loveveryfans-20` is automatically added to all Amazon URLs

---

### 3. `scrape_reviews.py`

Collects parent reviews from multiple platforms (Reddit, Amazon, Xiaohongshu) and optionally uses an LLM to summarise pros and cons.

#### Usage

```bash
# All kits, all sources
python scrape_reviews.py

# Specific kits, Reddit only
python scrape_reviews.py --kit looker --source reddit

# Reddit + Amazon
python scrape_reviews.py --source reddit amazon

# With LLM summarisation (requires OPENAI_API_KEY)
python scrape_reviews.py --summarise

# Xiaohongshu with authentication cookie
python scrape_reviews.py --source xiaohongshu --xhs-cookie "cookie_string"

# Custom output and delay
python scrape_reviews.py -o output/reviews.json --delay 3.0
```

#### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--kit SLUG [SLUG ...]` | all kits | Kit slug(s) to collect reviews for |
| `--source {reddit,amazon,xiaohongshu}` | all sources | Review platforms to scrape |
| `-o, --output PATH` | `lovevery_reviews.json` | Output JSON file path |
| `--summarise` | off | Use LLM to generate pros/cons summary |
| `--xhs-cookie STRING` | `$XHS_COOKIE` | Xiaohongshu auth cookie |
| `--delay SECONDS` | `2.0` | Delay between requests |
| `-v, --verbose` | off | Enable debug logging |

#### Output Format

```json
[
  {
    "kit_slug": "looker",
    "reddit": [
      {
        "title": "Lovevery Looker Kit Review",
        "selftext": "We got the Looker kit and...",
        "score": 42,
        "num_comments": 15,
        "url": "https://reddit.com/r/...",
        "comments": ["Great kit!", "..."]
      }
    ],
    "amazon": [...],
    "xiaohongshu": [...],
    "summary": {
      "pros_cn": "优点...",
      "pros_en": "Pros...",
      "cons_cn": "缺点...",
      "cons_en": "Cons..."
    }
  }
]
```

#### Notes

- **Reddit**: Uses the public JSON API; no authentication needed but rate-limited.
- **Amazon**: Basic scraping; Amazon may block requests. For production use, consider the Amazon Product Advertising API.
- **Xiaohongshu**: Requires authentication cookie for full access. Set via `--xhs-cookie` or `XHS_COOKIE` env var.
- **LLM Summary**: Requires `OPENAI_API_KEY`. Uses `gpt-4.1-mini` model.

---

### 3. `scrape_cleaning_guide.py`

Collects toy cleaning instructions from Lovevery care pages and product descriptions, classifies toys by material type, and provides cleaning advice.

#### Usage

```bash
# All kits
python scrape_cleaning_guide.py

# Specific kits
python scrape_cleaning_guide.py --kit looker charmer

# Use LLM to fill in missing material/cleaning data
python scrape_cleaning_guide.py --enrich

# Use existing kit data as input instead of re-scraping
python scrape_cleaning_guide.py --input data/lovevery_kits.json

# Custom output
python scrape_cleaning_guide.py -o output/cleaning.json
```

#### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--kit SLUG [SLUG ...]` | all kits | Kit slug(s) to process |
| `--input PATH` | (none) | Existing kit data JSON to use as base |
| `-o, --output PATH` | `lovevery_cleaning_guide.json` | Output JSON file path |
| `--enrich` | off | Use LLM to identify materials and generate cleaning advice |
| `--delay SECONDS` | `1.5` | Delay between requests |
| `-v, --verbose` | off | Enable debug logging |

#### Output Format

```json
[
  {
    "kit_id": "adventurer",
    "kit_name": "The Adventurer",
    "toys": [
      {
        "name": "Race & Chase Ramp",
        "name_zh": "滚滚追逐赛道",
        "material": "木质/Wood",
        "cleaning_zh": "用湿布擦拭即可，避免浸泡在水中",
        "cleaning_en": "Wipe clean with a damp cloth. Do not expose to excess water."
      }
    ]
  }
]
```

#### Supported Material Types

| Chinese | English | Default Cleaning Method |
|---------|---------|------------------------|
| 木质 | Wood | Wipe with damp cloth, avoid soaking |
| 硅胶 | Silicone | Mild soapy water, no boiling |
| 橡胶 | Rubber | Mild soapy water, no boiling |
| 布质(棉) | Fabric(Cotton) | Machine wash cold, gentle cycle |
| 毛毡 | Felt | Hand wash, air dry |
| 塑料 | Plastic | Mild soapy water, hand wash |
| 纸板 | Cardboard | Dry or lightly damp cloth |
| 印刷品 | Printed Material | Dry or lightly damp cloth |
| 不锈钢 | Stainless Steel | Mild soapy water, dry thoroughly |

---

### 4. `generate_toy_data.py`

Converts the JSON output from the scraping scripts into TypeScript data files that can be directly imported by the React frontend.

#### Usage

```bash
# Generate toyReviews.ts
python generate_toy_data.py reviews \
  -i data/lovevery_reviews_final.json \
  -o ../client/src/data/

# Generate toyCleaningGuide.ts
python generate_toy_data.py cleaning \
  -i data/lovevery_cleaning_guide.json \
  -o ../client/src/data/

# Generate toyImages.ts
python generate_toy_data.py images \
  -i data/lovevery_kits.json \
  -o ../client/src/data/

# Generate all TypeScript files at once
python generate_toy_data.py all \
  --reviews-input data/reviews.json \
  --cleaning-input data/cleaning.json \
  --images-input data/kits.json \
  -o ../client/src/data/
```

#### Subcommands

| Subcommand | Input | Output |
|------------|-------|--------|
| `reviews` | Reviews JSON | `toyReviews.ts` |
| `cleaning` | Cleaning guide JSON | `toyCleaningGuide.ts` |
| `images` | Kits JSON | `toyImages.ts` |
| `all` | Multiple JSON files | All `.ts` files |

#### Generated TypeScript API

**toyReviews.ts:**
```typescript
getToyReview(kitId: string, toyName: string, lang: "cn" | "en"): ToyReview | null
```

**toyCleaningGuide.ts:**
```typescript
getCleaningInfo(kitId: string, toyNameZh: string): CleaningInfo | null
```

**toyImages.ts:**
```typescript
getKitHeroImage(kitId: string): string
getToyImage(kitId: string, index: number): string
getKitToyImages(kitId: string): string[]
```

---

## Full Pipeline Example

Run the complete data pipeline from scratch:

```bash
cd scripts/

# Step 1: Install dependencies
pip install -r requirements.txt

# Step 2: Scrape official Lovevery data
python scrape_lovevery_official.py -o data/lovevery_kits.json

# Step 3: Collect reviews (with LLM summarisation)
export OPENAI_API_KEY="sk-..."
python scrape_reviews.py --summarise -o data/lovevery_reviews.json

# Step 4: Generate cleaning guide (with LLM enrichment)
python scrape_cleaning_guide.py \
  --input data/lovevery_kits.json \
  --enrich \
  -o data/lovevery_cleaning_guide.json

# Step 5: Generate TypeScript data files
python generate_toy_data.py all \
  --reviews-input data/lovevery_reviews.json \
  --cleaning-input data/lovevery_cleaning_guide.json \
  --images-input data/lovevery_kits.json \
  -o ../client/src/data/

# Step 6: Build the website
cd ..
pnpm build:static
```

## Rate Limiting & Ethics

All scripts include configurable request delays (`--delay`) to be respectful of the target websites. The default delays are:

- Lovevery official: 1.5s
- Reddit: 2.0s
- Amazon: 2.0s
- Xiaohongshu: 2.0s

Please be mindful of the websites' terms of service and robots.txt when using these scripts.

## License

These scripts are part of the [Lovevery Kit Guide](https://github.com/gzxultra/lovevery-kit-guide) project, created by Lovevery enthusiasts for non-commercial purposes.
