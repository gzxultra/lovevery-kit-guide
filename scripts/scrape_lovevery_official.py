#!/usr/bin/env python3
"""
scrape_lovevery_official.py — Scrape Kit & Toy data from Lovevery official website.

This script fetches product information from lovevery.com including:
  - Kit names, slugs, age ranges, descriptions
  - Toy names, descriptions, hero/product images (Contentful CDN URLs)
  - Pricing information (when available)

Data is extracted from the server-rendered HTML and embedded JSON-LD / Next.js
data payloads.  The output is a single JSON file that can be fed into
`generate_toy_data.py` to produce TypeScript data files for the website.

Usage:
    python scrape_lovevery_official.py                       # scrape all kits
    python scrape_lovevery_official.py --kit looker senser    # scrape specific kits
    python scrape_lovevery_official.py -o data/kits.json      # custom output path

Requirements:
    pip install requests beautifulsoup4 lxml
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://lovevery.com"
PLAY_KITS_URL = f"{BASE_URL}/products/the-play-kits"
CONTENTFUL_CDN = "images.ctfassets.net"

# All known kit slugs (in developmental order)
ALL_KIT_SLUGS = [
    "looker", "charmer", "senser", "explorer", "observer", "thinker",
    "babbler", "pioneer", "realist", "analyst", "companion", "free-spirit",
    "helper", "enthusiast", "planner", "adventurer", "persister",
    "challenger", "investigator", "examiner", "connector", "creative",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Rate-limit: seconds between requests
REQUEST_DELAY = 1.5

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def fetch_page(url: str, session: requests.Session) -> str | None:
    """Fetch a page and return its HTML text, or None on failure."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as exc:
        log.error("Failed to fetch %s: %s", url, exc)
        return None


def extract_json_ld(soup: BeautifulSoup) -> list[dict]:
    """Extract all JSON-LD blocks from the page."""
    results = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string)
            results.append(data)
        except (json.JSONDecodeError, TypeError):
            continue
    return results


def extract_next_data(soup: BeautifulSoup) -> dict | None:
    """Extract Next.js __NEXT_DATA__ payload if present."""
    tag = soup.find("script", id="__NEXT_DATA__")
    if tag and tag.string:
        try:
            return json.loads(tag.string)
        except json.JSONDecodeError:
            return None
    return None


def extract_contentful_images(html: str) -> list[str]:
    """Find all Contentful CDN image URLs in the HTML source."""
    pattern = rf"https://{re.escape(CONTENTFUL_CDN)}/[^\s\"'<>)}}]+"
    urls = re.findall(pattern, html)
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for u in urls:
        clean = u.rstrip(",;")
        if clean not in seen:
            seen.add(clean)
            unique.append(clean)
    return unique


def extract_meta(soup: BeautifulSoup, property_name: str) -> str | None:
    """Extract content from a <meta> tag by property or name."""
    tag = soup.find("meta", attrs={"property": property_name}) or soup.find(
        "meta", attrs={"name": property_name}
    )
    if tag:
        return tag.get("content")
    return None


# ---------------------------------------------------------------------------
# Scraping logic
# ---------------------------------------------------------------------------


def scrape_kit_listing(session: requests.Session) -> list[dict[str, Any]]:
    """Scrape the main Play Kits listing page for an overview of all kits."""
    log.info("Fetching Play Kits listing page: %s", PLAY_KITS_URL)
    html = fetch_page(PLAY_KITS_URL, session)
    if not html:
        log.warning("Could not fetch listing page; falling back to individual pages.")
        return []

    soup = BeautifulSoup(html, "lxml")
    kits_overview: list[dict[str, Any]] = []

    # Try JSON-LD first
    for ld in extract_json_ld(soup):
        if ld.get("@type") == "ItemList":
            for item in ld.get("itemListElement", []):
                kits_overview.append(
                    {
                        "name": item.get("name", ""),
                        "url": item.get("url", ""),
                        "image": item.get("image", ""),
                    }
                )

    # Also extract images from HTML
    images = extract_contentful_images(html)
    log.info("Found %d Contentful images on listing page.", len(images))

    return kits_overview


def scrape_kit_detail(
    slug: str, session: requests.Session
) -> dict[str, Any] | None:
    """Scrape a single Kit product page for detailed information."""
    url = f"{PLAY_KITS_URL}-the-{slug}"
    log.info("Scraping kit: %s → %s", slug, url)
    html = fetch_page(url, session)
    if not html:
        return None

    soup = BeautifulSoup(html, "lxml")

    # Basic metadata
    title = soup.find("title")
    title_text = title.get_text(strip=True) if title else ""
    description = extract_meta(soup, "og:description") or extract_meta(
        soup, "description"
    ) or ""
    og_image = extract_meta(soup, "og:image") or ""

    # Extract all Contentful images (hero, toy images, etc.)
    images = extract_contentful_images(html)

    # Try to extract price from JSON-LD Product schema
    price = None
    currency = "USD"
    for ld in extract_json_ld(soup):
        if ld.get("@type") == "Product":
            offers = ld.get("offers", {})
            if isinstance(offers, dict):
                price = offers.get("price")
                currency = offers.get("priceCurrency", "USD")
            elif isinstance(offers, list) and offers:
                price = offers[0].get("price")
                currency = offers[0].get("priceCurrency", "USD")

    # Extract toy names from the page content
    # Lovevery pages typically list toys in specific sections
    toys: list[dict[str, str]] = []
    toy_sections = soup.find_all(
        ["h3", "h4", "p", "span"],
        string=re.compile(r".{3,80}$"),
    )
    # This is a heuristic; the actual structure varies by page version

    # Try Next.js data for more structured info
    next_data = extract_next_data(soup)
    if next_data:
        props = next_data.get("props", {}).get("pageProps", {})
        product = props.get("product", {})
        if product:
            log.info("  Found Next.js product data for %s", slug)
            # Extract toy/component info from product data if available
            components = product.get("components", [])
            for comp in components:
                if isinstance(comp, dict) and comp.get("name"):
                    toys.append(
                        {
                            "name": comp.get("name", ""),
                            "description": comp.get("description", ""),
                            "image": comp.get("image", {}).get("url", "")
                            if isinstance(comp.get("image"), dict)
                            else "",
                        }
                    )

    kit_data: dict[str, Any] = {
        "slug": slug,
        "title": title_text,
        "description": description,
        "og_image": og_image,
        "price": price,
        "currency": currency,
        "images": images[:20],  # Limit to first 20 images
        "toys": toys,
        "url": url,
    }

    return kit_data


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape Lovevery official website for Kit & Toy data.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                # Scrape all 22 kits
  %(prog)s --kit looker charmer senser    # Scrape specific kits only
  %(prog)s -o output/kits.json            # Custom output path
  %(prog)s --delay 2.0                    # Slower request rate
        """,
    )
    parser.add_argument(
        "--kit",
        nargs="+",
        metavar="SLUG",
        help="Kit slug(s) to scrape (default: all kits). "
        f"Valid slugs: {', '.join(ALL_KIT_SLUGS)}",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default="lovevery_kits.json",
        help="Output JSON file path (default: lovevery_kits.json)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=REQUEST_DELAY,
        help=f"Delay between requests in seconds (default: {REQUEST_DELAY})",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable debug logging",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    slugs = args.kit if args.kit else ALL_KIT_SLUGS

    # Validate slugs
    invalid = [s for s in slugs if s not in ALL_KIT_SLUGS]
    if invalid:
        log.error("Unknown kit slug(s): %s", ", ".join(invalid))
        log.info("Valid slugs: %s", ", ".join(ALL_KIT_SLUGS))
        sys.exit(1)

    session = requests.Session()

    # Step 1: Scrape listing page for overview
    listing = scrape_kit_listing(session)
    log.info("Listing page returned %d kit overviews.", len(listing))

    # Step 2: Scrape each kit detail page
    results: list[dict[str, Any]] = []
    for i, slug in enumerate(slugs):
        if i > 0:
            time.sleep(args.delay)
        kit_data = scrape_kit_detail(slug, session)
        if kit_data:
            results.append(kit_data)
            log.info(
                "  ✓ %s — %d images, %d toys",
                slug,
                len(kit_data["images"]),
                len(kit_data["toys"]),
            )
        else:
            log.warning("  ✗ Failed to scrape %s", slug)

    # Step 3: Write output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    log.info("Done! Scraped %d/%d kits → %s", len(results), len(slugs), output_path)


if __name__ == "__main__":
    main()
