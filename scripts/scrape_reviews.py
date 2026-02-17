#!/usr/bin/env python3
"""
scrape_reviews.py — Collect toy reviews from multiple platforms and summarise
pros/cons using an LLM.

Supported sources:
  - Reddit (via public JSON API)
  - Amazon product reviews (via HTML scraping)
  - Xiaohongshu / 小红书 (via keyword search, requires cookie)

The script collects raw review text, then optionally calls an OpenAI-compatible
LLM to distil the reviews into concise pros and cons for each toy.

Usage:
    python scrape_reviews.py                              # all kits, all sources
    python scrape_reviews.py --kit looker --source reddit  # specific kit & source
    python scrape_reviews.py --summarise                   # also run LLM summary
    python scrape_reviews.py -o reviews.json               # custom output

Requirements:
    pip install requests beautifulsoup4 lxml openai
    Environment variable: OPENAI_API_KEY (only needed with --summarise)
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

REDDIT_SEARCH_URL = "https://www.reddit.com/search.json"
REDDIT_SUBREDDITS = ["Montessori", "beyondthebump", "Parenting", "NewParents"]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

REQUEST_DELAY = 2.0  # seconds between requests

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
# Reddit scraper
# ---------------------------------------------------------------------------


def search_reddit(
    query: str,
    session: requests.Session,
    subreddit: str | None = None,
    limit: int = 25,
) -> list[dict[str, Any]]:
    """Search Reddit for posts matching *query* and return simplified results."""
    params: dict[str, Any] = {
        "q": query,
        "limit": limit,
        "sort": "relevance",
        "t": "all",
        "type": "link",
    }
    if subreddit:
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params["restrict_sr"] = "on"
    else:
        url = REDDIT_SEARCH_URL

    try:
        resp = session.get(url, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, json.JSONDecodeError) as exc:
        log.error("Reddit search failed for '%s': %s", query, exc)
        return []

    posts: list[dict[str, Any]] = []
    for child in data.get("data", {}).get("children", []):
        post = child.get("data", {})
        posts.append(
            {
                "title": post.get("title", ""),
                "selftext": post.get("selftext", "")[:2000],
                "score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "subreddit": post.get("subreddit", ""),
                "created_utc": post.get("created_utc", 0),
            }
        )
    return posts


def fetch_reddit_comments(
    permalink: str, session: requests.Session, limit: int = 50
) -> list[str]:
    """Fetch top-level comments from a Reddit post."""
    url = f"https://www.reddit.com{permalink}.json"
    try:
        resp = session.get(
            url, params={"limit": limit}, headers=HEADERS, timeout=20
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, json.JSONDecodeError) as exc:
        log.error("Failed to fetch comments for %s: %s", permalink, exc)
        return []

    comments: list[str] = []
    if len(data) >= 2:
        for child in data[1].get("data", {}).get("children", []):
            body = child.get("data", {}).get("body", "")
            if body and len(body) > 20:
                comments.append(body[:1500])
    return comments


def scrape_reddit_reviews(
    kit_slug: str, session: requests.Session
) -> list[dict[str, Any]]:
    """Collect Reddit posts and comments about a Lovevery kit."""
    queries = [
        f"Lovevery {kit_slug} play kit",
        f"Lovevery {kit_slug} review",
        f"Lovevery play kit {kit_slug} worth it",
    ]
    all_posts: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    for query in queries:
        posts = search_reddit(query, session)
        for post in posts:
            if post["url"] not in seen_urls:
                seen_urls.add(post["url"])
                all_posts.append(post)
        time.sleep(REQUEST_DELAY)

    # Fetch comments for top posts (by score)
    all_posts.sort(key=lambda p: p["score"], reverse=True)
    for post in all_posts[:5]:
        permalink = post["url"].replace("https://reddit.com", "")
        if permalink:
            comments = fetch_reddit_comments(permalink, session)
            post["comments"] = comments
            time.sleep(REQUEST_DELAY)

    log.info("  Reddit: %d posts collected for '%s'", len(all_posts), kit_slug)
    return all_posts


# ---------------------------------------------------------------------------
# Amazon scraper (basic)
# ---------------------------------------------------------------------------


def scrape_amazon_reviews(
    kit_slug: str, session: requests.Session
) -> list[dict[str, Any]]:
    """
    Search Amazon for Lovevery kit reviews.

    Note: Amazon aggressively blocks scrapers.  This function performs a basic
    search and extracts what it can.  For production use, consider the Amazon
    Product Advertising API or a dedicated scraping service.
    """
    search_url = "https://www.amazon.com/s"
    params = {"k": f"Lovevery {kit_slug} play kit", "i": "toys-and-games"}

    try:
        resp = session.get(
            search_url, params=params, headers=HEADERS, timeout=20
        )
        if resp.status_code == 503:
            log.warning("  Amazon returned 503 (bot detection) for '%s'", kit_slug)
            return []
        resp.raise_for_status()
    except requests.RequestException as exc:
        log.error("  Amazon search failed for '%s': %s", kit_slug, exc)
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    results: list[dict[str, Any]] = []

    for item in soup.select("[data-component-type='s-search-result']")[:5]:
        title_el = item.select_one("h2 a span")
        rating_el = item.select_one("[class*='a-icon-alt']")
        review_count_el = item.select_one("[class*='s-underline-text']")
        link_el = item.select_one("h2 a")

        results.append(
            {
                "title": title_el.get_text(strip=True) if title_el else "",
                "rating": rating_el.get_text(strip=True) if rating_el else "",
                "review_count": (
                    review_count_el.get_text(strip=True) if review_count_el else ""
                ),
                "url": (
                    f"https://www.amazon.com{link_el['href']}"
                    if link_el and link_el.get("href")
                    else ""
                ),
            }
        )

    log.info("  Amazon: %d product results for '%s'", len(results), kit_slug)
    return results


# ---------------------------------------------------------------------------
# Xiaohongshu / 小红书 scraper (basic keyword search)
# ---------------------------------------------------------------------------


def scrape_xiaohongshu_reviews(
    kit_slug: str, session: requests.Session, cookie: str | None = None
) -> list[dict[str, Any]]:
    """
    Search Xiaohongshu for Lovevery kit reviews.

    Xiaohongshu requires authentication for most API access.  This function
    performs a basic web search.  For full access, provide a valid cookie
    string via the --xhs-cookie argument or XHS_COOKIE environment variable.
    """
    # Map kit slugs to Chinese search terms
    kit_names_zh: dict[str, str] = {
        "looker": "Lovevery 观察者",
        "charmer": "Lovevery 魅力者",
        "senser": "Lovevery 感知者",
        "explorer": "Lovevery 探索者",
        "observer": "Lovevery 观察家",
        "thinker": "Lovevery 思考者",
        "babbler": "Lovevery 学语者",
        "pioneer": "Lovevery 先锋者",
        "realist": "Lovevery 现实主义者",
        "analyst": "Lovevery 分析家",
        "companion": "Lovevery 伙伴",
        "free-spirit": "Lovevery 自由精神",
        "helper": "Lovevery 小帮手",
        "enthusiast": "Lovevery 热情者",
        "planner": "Lovevery 规划者",
        "adventurer": "Lovevery 冒险家",
        "persister": "Lovevery 坚持者",
        "challenger": "Lovevery 挑战者",
        "investigator": "Lovevery 调查者",
        "examiner": "Lovevery 审查者",
        "connector": "Lovevery 连接者",
        "creative": "Lovevery 创造者",
    }

    query = kit_names_zh.get(kit_slug, f"Lovevery {kit_slug}")
    search_url = f"https://www.xiaohongshu.com/search_result?keyword={query}"

    headers = {**HEADERS}
    if cookie:
        headers["Cookie"] = cookie

    try:
        resp = session.get(search_url, headers=headers, timeout=20)
        if resp.status_code != 200:
            log.warning(
                "  Xiaohongshu returned %d for '%s' (may need cookie)",
                resp.status_code,
                kit_slug,
            )
            return []
    except requests.RequestException as exc:
        log.error("  Xiaohongshu search failed for '%s': %s", kit_slug, exc)
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    results: list[dict[str, Any]] = []

    # Extract note cards from search results
    for card in soup.select("[class*='note-item']")[:10]:
        title_el = card.select_one("[class*='title']")
        desc_el = card.select_one("[class*='desc']")
        link_el = card.select_one("a")

        results.append(
            {
                "title": title_el.get_text(strip=True) if title_el else "",
                "description": desc_el.get_text(strip=True) if desc_el else "",
                "url": (
                    f"https://www.xiaohongshu.com{link_el['href']}"
                    if link_el and link_el.get("href")
                    else ""
                ),
            }
        )

    log.info("  Xiaohongshu: %d notes for '%s'", len(results), kit_slug)
    return results


# ---------------------------------------------------------------------------
# LLM Summarisation
# ---------------------------------------------------------------------------


def summarise_reviews_with_llm(
    kit_slug: str, raw_reviews: dict[str, Any]
) -> dict[str, str] | None:
    """
    Use an OpenAI-compatible LLM to summarise raw reviews into pros and cons.

    Returns a dict with keys: pros_cn, pros_en, cons_cn, cons_en
    """
    try:
        from openai import OpenAI
    except ImportError:
        log.error("openai package not installed. Run: pip install openai")
        return None

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        log.error("OPENAI_API_KEY not set. Cannot summarise reviews.")
        return None

    client = OpenAI()

    # Collect all review text
    review_texts: list[str] = []
    for source, items in raw_reviews.items():
        if source == "kit_slug":
            continue
        for item in items:
            if isinstance(item, dict):
                text = item.get("selftext") or item.get("description") or item.get("title", "")
                if text:
                    review_texts.append(text[:500])
                for comment in item.get("comments", []):
                    review_texts.append(comment[:500])

    if not review_texts:
        log.warning("  No review text to summarise for '%s'", kit_slug)
        return None

    combined = "\n---\n".join(review_texts[:30])  # Limit to 30 excerpts

    prompt = f"""Based on the following parent reviews about the Lovevery "{kit_slug}" Play Kit,
summarise the key pros and cons. Provide the summary in both Chinese and English.

Format your response as JSON:
{{
  "pros_cn": "优点摘要（中文）",
  "pros_en": "Pros summary (English)",
  "cons_cn": "缺点摘要（中文）",
  "cons_en": "Cons summary (English)"
}}

Reviews:
{combined}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarises product reviews. "
                    "Always respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )
        content = response.choices[0].message.content or ""
        # Extract JSON from response
        json_match = re.search(r"\{[^{}]+\}", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            log.warning("  LLM response did not contain valid JSON for '%s'", kit_slug)
            return None
    except Exception as exc:
        log.error("  LLM summarisation failed for '%s': %s", kit_slug, exc)
        return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Collect Lovevery toy reviews from multiple platforms.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                        # All kits, all sources
  %(prog)s --kit looker charmer                    # Specific kits
  %(prog)s --source reddit                         # Reddit only
  %(prog)s --source reddit amazon                  # Reddit + Amazon
  %(prog)s --summarise                             # Also generate LLM summaries
  %(prog)s --xhs-cookie "cookie_string_here"       # Xiaohongshu with auth
  %(prog)s -o output/reviews.json --delay 3.0      # Custom output & delay
        """,
    )
    parser.add_argument(
        "--kit",
        nargs="+",
        metavar="SLUG",
        help="Kit slug(s) to collect reviews for (default: all kits)",
    )
    parser.add_argument(
        "--source",
        nargs="+",
        choices=["reddit", "amazon", "xiaohongshu"],
        default=["reddit", "amazon", "xiaohongshu"],
        help="Review sources to scrape (default: all)",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        default="lovevery_reviews.json",
        help="Output JSON file path (default: lovevery_reviews.json)",
    )
    parser.add_argument(
        "--summarise",
        action="store_true",
        help="Use LLM to summarise reviews into pros/cons (requires OPENAI_API_KEY)",
    )
    parser.add_argument(
        "--xhs-cookie",
        type=str,
        default=os.environ.get("XHS_COOKIE"),
        help="Xiaohongshu cookie string for authenticated access",
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
    all_results: list[dict[str, Any]] = []

    for i, slug in enumerate(slugs):
        log.info("Collecting reviews for kit: %s (%d/%d)", slug, i + 1, len(slugs))
        kit_reviews: dict[str, Any] = {"kit_slug": slug}

        if "reddit" in args.source:
            kit_reviews["reddit"] = scrape_reddit_reviews(slug, session)
            time.sleep(args.delay)

        if "amazon" in args.source:
            kit_reviews["amazon"] = scrape_amazon_reviews(slug, session)
            time.sleep(args.delay)

        if "xiaohongshu" in args.source:
            kit_reviews["xiaohongshu"] = scrape_xiaohongshu_reviews(
                slug, session, args.xhs_cookie
            )
            time.sleep(args.delay)

        if args.summarise:
            summary = summarise_reviews_with_llm(slug, kit_reviews)
            if summary:
                kit_reviews["summary"] = summary

        all_results.append(kit_reviews)

    # Write output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    log.info("Done! Collected reviews for %d kits → %s", len(all_results), output_path)


if __name__ == "__main__":
    main()
