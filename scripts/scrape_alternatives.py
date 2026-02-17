#!/usr/bin/env python3
"""
Lovevery Play Kit Amazon Alternatives Scraper

This script searches for affordable Amazon alternatives for each toy in the
Lovevery Play Kit lineup. It uses web search to find recommendations from
Amazon, Reddit (r/Montessori, r/BabyBumps, r/toddlers), and parenting blogs.

Usage:
    python3 scrape_alternatives.py [--kit KIT_ID] [--output OUTPUT_FILE]

Options:
    --kit KIT_ID        Only scrape alternatives for a specific kit (e.g., "looker")
    --output FILE       Output JSON file path (default: lovevery_alternatives.json)
    --update            Update existing data instead of overwriting
    --verbose           Print detailed progress information

Requirements:
    pip3 install requests beautifulsoup4 openai

Environment:
    OPENAI_API_KEY      Required for AI-powered search and analysis
"""

import argparse
import json
import os
import sys
import time
import re
from pathlib import Path
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Please install required packages: pip3 install requests beautifulsoup4")
    sys.exit(1)

try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    print("Warning: openai package not installed. AI-powered search disabled.")
    print("Install with: pip3 install openai")


# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "client" / "src" / "data"
DEFAULT_OUTPUT = PROJECT_ROOT / "scripts" / "lovevery_alternatives.json"

# Search configuration
SEARCH_DELAY = 1.0  # seconds between requests to avoid rate limiting
MAX_ALTERNATIVES_PER_TOY = 3
MIN_RATING = 4.0
MIN_REVIEWS = 50

# Amazon search URL template
AMAZON_SEARCH_URL = "https://www.amazon.com/s?k={query}"

# Headers to mimic a browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


# ============================================================================
# Toy Inventory Extraction
# ============================================================================

def extract_toy_inventory() -> list[dict]:
    """Extract toy inventory from kits.ts TypeScript file."""
    kits_file = DATA_DIR / "kits.ts"
    if not kits_file.exists():
        print(f"Error: {kits_file} not found")
        sys.exit(1)

    content = kits_file.read_text(encoding="utf-8")
    lines = content.split("\n")

    all_kits = []
    kit_id = None
    kit_name = None
    toys = []

    for line in lines:
        id_match = re.search(r'^\s*id:\s*"([^"]+)"', line)
        name_match = re.search(r'^\s*name:\s*"([^"]+)"', line)
        en_name_match = re.search(r'englishName:\s*"([^"]+)"', line)

        if id_match and "kit" not in line.lower():
            if kit_id and toys:
                all_kits.append({
                    "kitId": kit_id,
                    "kitName": kit_name,
                    "toys": toys,
                })
                toys = []
            kit_id = id_match.group(1)

        if name_match and not en_name_match and "englishName" not in line:
            if kit_id and (not kit_name or "The " in name_match.group(1)):
                kit_name = name_match.group(1)

        if en_name_match:
            cn_name = re.search(r'name:\s*"([^"]+)"', line)
            category = re.search(r'category:\s*"([^"]+)"', line)
            cat_en = re.search(r'categoryEn:\s*"([^"]+)"', line)
            toys.append({
                "name": cn_name.group(1) if cn_name else "",
                "englishName": en_name_match.group(1),
                "category": category.group(1) if category else "",
                "categoryEn": cat_en.group(1) if cat_en else "",
            })

    if kit_id and toys:
        all_kits.append({
            "kitId": kit_id,
            "kitName": kit_name,
            "toys": toys,
        })

    return all_kits


# ============================================================================
# AI-Powered Alternative Search
# ============================================================================

def search_alternatives_with_ai(toy_name: str, toy_category: str, kit_name: str) -> list[dict]:
    """Use OpenAI API to find Amazon alternatives for a toy."""
    if not HAS_OPENAI:
        return []

    client = OpenAI()

    prompt = f"""Find 1-3 high-quality, affordable Amazon alternatives for this Lovevery toy:

Toy: {toy_name}
Category: {toy_category}
From Kit: {kit_name}

Requirements:
- Must be available on Amazon US
- Rating 4.0+ stars with 50+ reviews
- Safe materials (BPA-free, non-toxic)
- Similar developmental purpose
- Good value for money

For each alternative, provide:
1. Product name (as listed on Amazon)
2. ASIN (the 10-character Amazon product ID, format: B0XXXXXXXXX)
3. Approximate price in USD
4. Rating (e.g., 4.7)
5. Approximate review count
6. Brief reason why it's a good alternative (in English)
7. Brief reason in Chinese

Return ONLY a JSON array (no markdown, no explanation):
[
  {{
    "name": "Product Name",
    "asin": "B0XXXXXXXXX",
    "price": "$XX.XX",
    "rating": 4.7,
    "reviewCount": 1234,
    "amazonUrl": "https://www.amazon.com/dp/B0XXXXXXXXX",
    "reasonEn": "English reason",
    "reasonCn": "中文原因"
  }}
]

If you cannot find suitable alternatives, return an empty array: []
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that finds Amazon product alternatives for baby/toddler toys. Always return valid JSON arrays only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        result = response.choices[0].message.content.strip()

        # Clean up markdown code blocks if present
        if result.startswith("```"):
            result = re.sub(r"^```(?:json)?\n?", "", result)
            result = re.sub(r"\n?```$", "", result)

        alternatives = json.loads(result)
        if isinstance(alternatives, list):
            return alternatives[:MAX_ALTERNATIVES_PER_TOY]
        return []

    except Exception as e:
        print(f"  AI search error for '{toy_name}': {e}")
        return []


# ============================================================================
# Main Scraping Logic
# ============================================================================

def scrape_kit_alternatives(
    kit: dict,
    existing_data: Optional[dict] = None,
    verbose: bool = False,
) -> dict:
    """Scrape Amazon alternatives for all toys in a kit."""
    kit_id = kit["kitId"]
    kit_name = kit["kitName"]

    result = {
        "kitId": kit_id,
        "kitName": kit_name,
        "toys": [],
    }

    for i, toy in enumerate(kit["toys"]):
        toy_name = toy["englishName"]
        toy_cn = toy["name"]
        category = toy.get("categoryEn", toy.get("category", ""))

        if verbose:
            print(f"  [{i+1}/{len(kit['toys'])}] Searching alternatives for: {toy_name}")

        # Check if we already have data for this toy
        if existing_data:
            existing_toy = next(
                (t for t in existing_data.get("toys", []) if t["toyName"] == toy_name),
                None,
            )
            if existing_toy and existing_toy.get("alternatives"):
                if verbose:
                    print(f"    Using existing data ({len(existing_toy['alternatives'])} alternatives)")
                result["toys"].append(existing_toy)
                continue

        # Search for alternatives
        alternatives = search_alternatives_with_ai(toy_name, category, kit_name)

        toy_result = {
            "toyName": toy_name,
            "toyNameCn": toy_cn,
            "alternatives": alternatives,
        }
        result["toys"].append(toy_result)

        if verbose:
            print(f"    Found {len(alternatives)} alternatives")

        # Rate limiting
        time.sleep(SEARCH_DELAY)

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Amazon alternatives for Lovevery Play Kit toys"
    )
    parser.add_argument(
        "--kit",
        type=str,
        help="Only scrape a specific kit (e.g., 'looker')",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(DEFAULT_OUTPUT),
        help="Output JSON file path",
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Update existing data instead of overwriting",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress",
    )
    args = parser.parse_args()

    # Extract toy inventory
    print("Extracting toy inventory from kits.ts...")
    inventory = extract_toy_inventory()
    print(f"Found {len(inventory)} kits with {sum(len(k['toys']) for k in inventory)} toys")

    # Filter by kit if specified
    if args.kit:
        inventory = [k for k in inventory if k["kitId"] == args.kit]
        if not inventory:
            print(f"Error: Kit '{args.kit}' not found")
            sys.exit(1)
        print(f"Filtering to kit: {args.kit}")

    # Load existing data if updating
    existing_data = {}
    if args.update and os.path.exists(args.output):
        print(f"Loading existing data from {args.output}...")
        with open(args.output) as f:
            existing = json.load(f)
        existing_data = {k["kitId"]: k for k in existing}
        print(f"Loaded data for {len(existing_data)} kits")

    # Scrape alternatives
    results = []
    for i, kit in enumerate(inventory):
        print(f"\n[{i+1}/{len(inventory)}] Processing {kit['kitName']} ({kit['kitId']})...")
        existing_kit = existing_data.get(kit["kitId"])
        result = scrape_kit_alternatives(kit, existing_kit, verbose=args.verbose)
        results.append(result)

    # If updating, merge with existing data
    if args.update and existing_data:
        result_ids = {r["kitId"] for r in results}
        for kit_id, kit_data in existing_data.items():
            if kit_id not in result_ids:
                results.append(kit_data)

    # Sort by kit order
    kit_order = [k["kitId"] for k in extract_toy_inventory()]
    results.sort(key=lambda x: kit_order.index(x["kitId"]) if x["kitId"] in kit_order else 999)

    # Save results
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Print summary
    total_toys = sum(len(k["toys"]) for k in results)
    total_alts = sum(
        len(t.get("alternatives", []))
        for k in results
        for t in k["toys"]
    )
    toys_with_alts = sum(
        1 for k in results for t in k["toys"] if t.get("alternatives")
    )

    print(f"\n{'='*50}")
    print(f"Scraping Complete!")
    print(f"{'='*50}")
    print(f"Kits processed: {len(results)}")
    print(f"Total toys: {total_toys}")
    print(f"Total alternatives found: {total_alts}")
    print(f"Toys with alternatives: {toys_with_alts} ({toys_with_alts*100//max(total_toys,1)}%)")
    print(f"Output saved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
