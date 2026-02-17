#!/usr/bin/env python3
"""
scrape_cleaning_guide.py — Collect toy cleaning instructions from Lovevery
help pages, product pages, and community sources, then classify by material.

The script:
  1. Scrapes Lovevery's official care/cleaning pages
  2. Extracts material types from product descriptions
  3. Optionally uses an LLM to generate cleaning advice for toys whose
     material is known but cleaning instructions are missing
  4. Outputs a structured JSON file with per-toy cleaning info

Usage:
    python scrape_cleaning_guide.py                        # all kits
    python scrape_cleaning_guide.py --kit looker senser     # specific kits
    python scrape_cleaning_guide.py --enrich                # use LLM to fill gaps
    python scrape_cleaning_guide.py -o cleaning.json        # custom output

Requirements:
    pip install requests beautifulsoup4 lxml openai
    Environment variable: OPENAI_API_KEY (only needed with --enrich)
"""

from __future__ import annotations

import argparse
import json
import logging
import os
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

ALL_KIT_SLUGS = [
    "looker", "charmer", "senser", "explorer", "observer", "thinker",
    "babbler", "pioneer", "realist", "analyst", "companion", "free-spirit",
    "helper", "enthusiast", "planner", "adventurer", "persister",
    "challenger", "investigator", "examiner", "connector", "creative",
]

# Lovevery help/care pages
LOVEVERY_CARE_URL = "https://lovevery.com/pages/care-instructions"
LOVEVERY_HELP_URL = "https://help.lovevery.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

REQUEST_DELAY = 1.5

# ---------------------------------------------------------------------------
# Material classification rules
# ---------------------------------------------------------------------------

# Maps material keywords (in product descriptions) to standardised labels
MATERIAL_KEYWORDS: dict[str, tuple[str, str]] = {
    "wood": ("木质", "Wood"),
    "wooden": ("木质", "Wood"),
    "beech": ("木质", "Wood"),
    "birch": ("木质", "Wood"),
    "silicone": ("硅胶", "Silicone"),
    "rubber": ("橡胶", "Rubber"),
    "natural rubber": ("橡胶", "Rubber"),
    "cotton": ("布质(棉)", "Fabric(Cotton)"),
    "fabric": ("布质(棉)", "Fabric(Cotton)"),
    "organic cotton": ("布质(棉)", "Fabric(Cotton)"),
    "felt": ("毛毡", "Felt"),
    "plastic": ("塑料", "Plastic"),
    "abs": ("塑料", "Plastic"),
    "cardboard": ("纸板", "Cardboard"),
    "paper": ("印刷品", "Printed Material"),
    "book": ("印刷品", "Printed Material"),
    "board book": ("印刷品", "Printed Material"),
    "stainless steel": ("不锈钢", "Stainless Steel"),
    "metal": ("不锈钢", "Stainless Steel"),
    "sticker": ("贴纸", "Sticker"),
    "kinetic sand": ("动力沙", "Kinetic Sand"),
    "sand": ("动力沙", "Kinetic Sand"),
    "magnetic": ("木质(磁性)", "Wood(Magnetic)"),
}

# Default cleaning instructions by material type
DEFAULT_CLEANING: dict[str, tuple[str, str]] = {
    "木质": (
        "用湿布擦拭即可，避免浸泡在水中",
        "Wipe clean with a damp cloth. Do not expose to excess water.",
    ),
    "硅胶": (
        "用温和肥皂水清洗，不可煮沸或消毒",
        "Wash in mild soapy water. Do not boil or sanitize.",
    ),
    "橡胶": (
        "用温和肥皂水清洗，不可煮沸或消毒",
        "Wash in mild soapy water. Do not boil or sanitize.",
    ),
    "布质(棉)": (
        "冷水机洗，温和洗涤剂，柔和模式，不可漂白，晾干或无热烘干",
        "Machine wash cold water, mild detergent, gentle cycle, no bleach. "
        "Air dry or tumble dry no heat.",
    ),
    "毛毡": (
        "手洗后晾干，避免大量水浸泡以防变形",
        "Hand wash and air dry. Avoid soaking in large amounts of water "
        "to prevent deformation.",
    ),
    "塑料": (
        "用温和肥皂水手洗，不可消毒，不可放入洗碗机",
        "Hand wash in mild soapy water. Do not sanitize or put in dishwasher.",
    ),
    "纸板": (
        "用干布或微湿布轻轻擦拭",
        "Wipe clean with a dry or lightly damp cloth.",
    ),
    "印刷品": (
        "用干布或微湿布轻轻擦拭",
        "Wipe clean with a dry or lightly damp cloth.",
    ),
    "不锈钢": (
        "用温和肥皂水手洗，擦干",
        "Hand wash in mild soapy water and dry thoroughly.",
    ),
    "木质(磁性)": (
        "用湿布擦拭即可，避免浸泡在水中",
        "Wipe clean with a damp cloth. Do not expose to excess water.",
    ),
    "贴纸": (
        "不可清洗",
        "Not washable.",
    ),
    "动力沙": (
        "不可水洗，保持干燥存放",
        "Do not wash with water. Store in a dry place.",
    ),
}

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
    """Fetch a page and return HTML text, or None on failure."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as exc:
        log.error("Failed to fetch %s: %s", url, exc)
        return None


def detect_material(text: str) -> tuple[str, str] | None:
    """Detect material type from a text description. Returns (cn, en) or None."""
    text_lower = text.lower()
    for keyword, labels in MATERIAL_KEYWORDS.items():
        if keyword in text_lower:
            return labels
    return None


def get_cleaning_for_material(material_cn: str) -> tuple[str, str] | None:
    """Look up default cleaning instructions for a material type."""
    return DEFAULT_CLEANING.get(material_cn)


# ---------------------------------------------------------------------------
# Scraping: Lovevery care pages
# ---------------------------------------------------------------------------


def scrape_lovevery_care_page(session: requests.Session) -> dict[str, Any]:
    """Scrape the Lovevery care instructions page for cleaning guidelines."""
    log.info("Fetching Lovevery care page: %s", LOVEVERY_CARE_URL)
    html = fetch_page(LOVEVERY_CARE_URL, session)
    if not html:
        return {}

    soup = BeautifulSoup(html, "lxml")
    care_data: dict[str, Any] = {}

    # Extract care instruction sections
    for section in soup.find_all(["div", "section"]):
        heading = section.find(["h2", "h3"])
        if heading:
            title = heading.get_text(strip=True)
            paragraphs = section.find_all("p")
            text = " ".join(p.get_text(strip=True) for p in paragraphs)
            if text:
                care_data[title] = text

    log.info("  Found %d care sections", len(care_data))
    return care_data


def scrape_kit_product_page(
    slug: str, session: requests.Session
) -> list[dict[str, Any]]:
    """Scrape a kit product page for toy names and material hints."""
    url = f"https://lovevery.com/products/the-play-kits-the-{slug}"
    log.info("Scraping product page for '%s'", slug)
    html = fetch_page(url, session)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    toys: list[dict[str, Any]] = []

    # Look for toy/component sections in the page
    # The structure varies, so we use multiple strategies

    # Strategy 1: Look for product component sections
    for el in soup.find_all(["h3", "h4"]):
        name = el.get_text(strip=True)
        if len(name) < 3 or len(name) > 100:
            continue

        # Look for description in the next sibling
        desc = ""
        next_el = el.find_next_sibling(["p", "div"])
        if next_el:
            desc = next_el.get_text(strip=True)[:500]

        material = detect_material(f"{name} {desc}")
        toys.append(
            {
                "name": name,
                "description": desc,
                "material_cn": material[0] if material else "未知",
                "material_en": material[1] if material else "Unknown",
            }
        )

    log.info("  Found %d toy entries for '%s'", len(toys), slug)
    return toys


# ---------------------------------------------------------------------------
# LLM enrichment
# ---------------------------------------------------------------------------


def enrich_with_llm(
    toys: list[dict[str, Any]], kit_slug: str
) -> list[dict[str, Any]]:
    """
    Use an LLM to identify materials and generate cleaning instructions
    for toys that are missing this information.
    """
    try:
        from openai import OpenAI
    except ImportError:
        log.error("openai package not installed. Run: pip install openai")
        return toys

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        log.error("OPENAI_API_KEY not set. Cannot enrich data.")
        return toys

    client = OpenAI()

    # Find toys needing enrichment
    needs_enrichment = [
        t for t in toys if t.get("material_cn") == "未知"
    ]

    if not needs_enrichment:
        return toys

    toy_list = "\n".join(
        f"- {t['name']}: {t.get('description', 'No description')[:200]}"
        for t in needs_enrichment
    )

    prompt = f"""For the following Lovevery "{kit_slug}" Play Kit toys, identify the most likely
material and provide cleaning instructions in both Chinese and English.

Toys:
{toy_list}

Respond as a JSON array:
[
  {{
    "name": "toy name",
    "material_cn": "材质中文",
    "material_en": "Material English",
    "cleaning_cn": "清洗说明中文",
    "cleaning_en": "Cleaning instructions English"
  }}
]"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that identifies toy materials "
                    "and provides cleaning advice. Respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=1000,
        )
        content = response.choices[0].message.content or ""
        # Extract JSON array
        json_match = re.search(r"\[[\s\S]*\]", content)
        if json_match:
            enriched = json.loads(json_match.group())
            # Merge enriched data back
            enriched_map = {e["name"]: e for e in enriched}
            for toy in toys:
                if toy["name"] in enriched_map:
                    e = enriched_map[toy["name"]]
                    toy["material_cn"] = e.get("material_cn", toy["material_cn"])
                    toy["material_en"] = e.get("material_en", toy["material_en"])
                    toy["cleaning_cn"] = e.get("cleaning_cn", "")
                    toy["cleaning_en"] = e.get("cleaning_en", "")
            log.info("  LLM enriched %d toys for '%s'", len(enriched), kit_slug)
    except Exception as exc:
        log.error("  LLM enrichment failed for '%s': %s", kit_slug, exc)

    return toys


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------


def build_cleaning_guide(
    kit_slug: str,
    toys: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build a complete cleaning guide entry for a kit."""
    guide_toys: list[dict[str, Any]] = []

    for toy in toys:
        material_cn = toy.get("material_cn", "未知")
        material_en = toy.get("material_en", "Unknown")
        material_label = f"{material_cn}/{material_en}"

        # Get cleaning instructions
        cleaning_cn = toy.get("cleaning_cn", "")
        cleaning_en = toy.get("cleaning_en", "")

        if not cleaning_cn and material_cn != "未知":
            default = get_cleaning_for_material(material_cn)
            if default:
                cleaning_cn, cleaning_en = default

        if not cleaning_cn:
            cleaning_cn = "无可用清洗建议"
            cleaning_en = "No cleaning instructions available."

        guide_toys.append(
            {
                "name": toy.get("name", ""),
                "name_zh": toy.get("name_zh", toy.get("name", "")),
                "material": material_label,
                "cleaning_zh": cleaning_cn,
                "cleaning_en": cleaning_en,
            }
        )

    return {
        "kit_id": kit_slug,
        "kit_name": f"The {kit_slug.replace('-', ' ').title()}",
        "toys": guide_toys,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Collect toy cleaning instructions and classify by material.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                  # All kits
  %(prog)s --kit looker charmer             # Specific kits
  %(prog)s --enrich                         # Use LLM to fill missing data
  %(prog)s --input existing_data.json       # Enrich existing data file
  %(prog)s -o output/cleaning_guide.json    # Custom output path
        """,
    )
    parser.add_argument(
        "--kit",
        nargs="+",
        metavar="SLUG",
        help="Kit slug(s) to process (default: all kits)",
    )
    parser.add_argument(
        "--input",
        type=str,
        help="Path to existing kit data JSON (from scrape_lovevery_official.py) "
        "to use as base instead of re-scraping",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default="lovevery_cleaning_guide.json",
        help="Output JSON file path (default: lovevery_cleaning_guide.json)",
    )
    parser.add_argument(
        "--enrich",
        action="store_true",
        help="Use LLM to identify materials and generate cleaning advice "
        "for toys with missing data (requires OPENAI_API_KEY)",
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
        sys.exit(1)

    session = requests.Session()

    # Step 1: Scrape care page for general guidelines
    care_data = scrape_lovevery_care_page(session)
    time.sleep(args.delay)

    # Step 2: Process each kit
    results: list[dict[str, Any]] = []

    if args.input:
        # Use existing data file as base
        log.info("Loading existing data from %s", args.input)
        with open(args.input, "r", encoding="utf-8") as f:
            existing = json.load(f)

        for kit_data in existing:
            kit_slug = kit_data.get("slug") or kit_data.get("kit_id", "")
            if slugs and kit_slug not in slugs:
                continue

            toys = kit_data.get("toys", [])
            if args.enrich:
                toys = enrich_with_llm(toys, kit_slug)

            guide = build_cleaning_guide(kit_slug, toys)
            results.append(guide)
    else:
        # Scrape from product pages
        for i, slug in enumerate(slugs):
            log.info("Processing kit: %s (%d/%d)", slug, i + 1, len(slugs))
            toys = scrape_kit_product_page(slug, session)
            time.sleep(args.delay)

            if args.enrich:
                toys = enrich_with_llm(toys, slug)

            guide = build_cleaning_guide(slug, toys)
            results.append(guide)

    # Step 3: Write output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    total_toys = sum(len(k["toys"]) for k in results)
    log.info(
        "Done! Generated cleaning guide for %d kits (%d toys) → %s",
        len(results),
        total_toys,
        output_path,
    )


if __name__ == "__main__":
    main()
