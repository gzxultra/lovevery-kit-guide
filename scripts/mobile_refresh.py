#!/usr/bin/env python3
"""
Mobile-endpoint Amazon product data refresher for Lovevery alternatives.

Uses Amazon's mobile endpoint which is less likely to trigger CAPTCHA.
Reads existing lovevery_alternatives.json and updates price, rating,
reviewCount, and imageUrl for all products with ASINs.
"""

import json
import os
import re
import random
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR = Path(__file__).parent
DATA_FILE = SCRIPT_DIR / "lovevery_alternatives.json"

DELAY_MIN = 4.0
DELAY_MAX = 8.0
DELAY_AFTER_ERROR = 15.0
MAX_RETRIES = 3

AFFILIATE_TAG = "loveveryfans-20"

# Mobile User-Agents
MOBILE_UAS = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
]


def create_session():
    """Create a new requests session with mobile headers."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": random.choice(MOBILE_UAS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    })
    return session


def extract_mobile_data(html: str) -> dict:
    """Extract product data from Amazon mobile HTML."""
    result = {"price": None, "rating": None, "reviewCount": None, "imageUrl": None}
    soup = BeautifulSoup(html, "html.parser")

    # ---- Price ----
    # Method 1: a-offscreen (full price like "$37.99")
    for offscreen in soup.find_all("span", {"class": "a-offscreen"}):
        text = offscreen.get_text().strip()
        m = re.search(r"\$(\d+\.\d{2})", text)
        if m:
            result["price"] = f"${m.group(1)}"
            break

    # Method 2: a-price span
    if not result["price"]:
        price_elem = soup.find("span", {"class": "a-price"})
        if price_elem:
            text = price_elem.get_text().strip()
            m = re.search(r"\$(\d+\.\d{2})", text)
            if m:
                result["price"] = f"${m.group(1)}"

    # Method 3: whole + fraction
    if not result["price"]:
        whole_elem = soup.find("span", {"class": "a-price-whole"})
        frac_elem = soup.find("span", {"class": "a-price-fraction"})
        if whole_elem:
            whole = whole_elem.get_text().strip().rstrip(".")
            frac = frac_elem.get_text().strip() if frac_elem else "00"
            if whole.isdigit():
                result["price"] = f"${whole}.{frac}"

    # Method 4: Search raw HTML for price patterns near "a-price" or "priceblock"
    if not result["price"]:
        m = re.search(r'"priceAmount":\s*"?(\d+\.?\d*)"?', html)
        if m:
            val = float(m.group(1))
            result["price"] = f"${val:.2f}"

    # ---- Rating ----
    rating_elem = soup.find("span", {"class": "a-icon-alt"})
    if rating_elem:
        m = re.search(r"(\d+\.?\d*)\s*out of", rating_elem.get_text().strip())
        if m:
            result["rating"] = float(m.group(1))

    if not result["rating"]:
        # Try from raw HTML
        m = re.search(r'"ratingValue":\s*"?(\d+\.?\d*)"?', html)
        if m:
            result["rating"] = float(m.group(1))

    # ---- Review Count ----
    # Method 1: Look for "X,XXX ratings" pattern in text
    review_patterns = re.findall(r"([\d,]+)\s*(?:global\s+)?(?:ratings|reviews)", html, re.IGNORECASE)
    if review_patterns:
        # Take the first reasonable one
        for rp in review_patterns:
            count = int(rp.replace(",", ""))
            if count > 0:
                result["reviewCount"] = count
                break

    # Method 2: acrCustomerReviewText
    if not result["reviewCount"]:
        acr = soup.find("span", id="acrCustomerReviewText")
        if acr:
            m = re.search(r"([\d,]+)", acr.get_text().strip())
            if m:
                result["reviewCount"] = int(m.group(1).replace(",", ""))

    # Method 3: From structured data
    if not result["reviewCount"]:
        m = re.search(r'"reviewCount":\s*"?(\d+)"?', html)
        if m:
            result["reviewCount"] = int(m.group(1))

    # ---- Image ----
    # Method 1: Product images from the page
    img_matches = re.findall(
        r'"(https://m\.media-amazon\.com/images/I/[A-Za-z0-9+_-]+\._AC_[^"]+\.jpg)"',
        html,
    )
    if img_matches:
        # Get the first product image and clean it to get high-res version
        img_url = img_matches[0]
        # Remove size parameters to get original
        img_url = re.sub(r"\._AC_[^.]+\.", ".", img_url)
        result["imageUrl"] = img_url

    # Method 2: landingImage
    if not result["imageUrl"]:
        img_elem = soup.find("img", {"id": "landingImage"})
        if not img_elem:
            img_elem = soup.find("img", {"class": "a-dynamic-image"})
        if img_elem:
            url = img_elem.get("data-old-hires") or img_elem.get("src")
            if url and "amazon" in url:
                url = re.sub(r"\._.*?_\.", ".", url)
                result["imageUrl"] = url

    # Method 3: From hiRes data
    if not result["imageUrl"]:
        hires = re.findall(r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+)"', html)
        if hires:
            result["imageUrl"] = hires[0]

    return result


def scrape_asin(session: requests.Session, asin: str) -> tuple:
    """Scrape a single ASIN. Returns (data_dict_or_None, new_session)."""
    url = f"https://www.amazon.com/dp/{asin}"

    for attempt in range(MAX_RETRIES):
        try:
            delay = random.uniform(DELAY_MIN, DELAY_MAX)
            if attempt > 0:
                delay = random.uniform(DELAY_AFTER_ERROR, DELAY_AFTER_ERROR + 10)
            time.sleep(delay)

            resp = session.get(url, timeout=20)

            if resp.status_code == 503:
                print(f"503", end=" ", flush=True)
                time.sleep(random.uniform(15, 25))
                session = create_session()
                continue

            if resp.status_code == 404:
                print(f"404", end=" ", flush=True)
                return None, session

            if resp.status_code != 200:
                print(f"HTTP{resp.status_code}", end=" ", flush=True)
                time.sleep(random.uniform(8, 15))
                continue

            # Check for CAPTCHA
            if "captcha" in resp.text.lower() and len(resp.text) < 50000:
                print(f"CAPTCHA", end=" ", flush=True)
                session = create_session()
                time.sleep(random.uniform(10, 20))
                continue

            data = extract_mobile_data(resp.text)

            if data["price"] or data["rating"]:
                return data, session
            else:
                print(f"no-data", end=" ", flush=True)
                # Maybe page didn't load fully, try again
                time.sleep(random.uniform(5, 10))
                continue

        except requests.exceptions.Timeout:
            print(f"timeout", end=" ", flush=True)
            continue
        except Exception as e:
            print(f"err:{str(e)[:20]}", end=" ", flush=True)
            continue

    return None, session


def main():
    # Load existing data
    print(f"Loading data from {DATA_FILE}...", flush=True)
    with open(DATA_FILE) as f:
        data = json.load(f)

    # Collect all products with ASINs
    products = []
    for kit in data:
        for toy in kit.get("toys", []):
            for alt in toy.get("alternatives", []):
                asin = alt.get("asin")
                if asin:
                    products.append(alt)

    print(f"Found {len(products)} products with ASINs", flush=True)

    session = create_session()
    success = 0
    failed = 0
    failed_asins = []

    for i, product in enumerate(products):
        asin = product["asin"]
        name = product.get("name", "")[:45]
        print(f"[{i+1}/{len(products)}] {name}... ", end="", flush=True)

        # Rotate session every 25 requests
        if i > 0 and i % 25 == 0:
            print(f"\n  --- Rotating session (batch {i//25 + 1}) ---", flush=True)
            session = create_session()
            time.sleep(random.uniform(5, 10))

        result, session = scrape_asin(session, asin)

        if result:
            if result["price"]:
                product["price"] = result["price"]
            if result["rating"] is not None:
                product["rating"] = result["rating"]
            if result["reviewCount"] is not None:
                product["reviewCount"] = result["reviewCount"]
            if result["imageUrl"]:
                product["imageUrl"] = result["imageUrl"]
            product["amazonUrl"] = f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"

            print(f"✓ {result['price']}, ★{result['rating']}, {result['reviewCount']}rev, img={'✓' if result['imageUrl'] else '✗'}", flush=True)
            success += 1
        else:
            print(f"✗ FAILED", flush=True)
            failed += 1
            failed_asins.append(asin)

        # Save progress every 10 products
        if (i + 1) % 10 == 0:
            with open(DATA_FILE, "w") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  --- Saved ({i+1}/{len(products)}, ✓{success} ✗{failed}) ---", flush=True)

    # Final save
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n{'='*60}", flush=True)
    print(f"SCRAPING COMPLETE", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"Total products: {len(products)}", flush=True)
    print(f"Successfully updated: {success}", flush=True)
    print(f"Failed: {failed}", flush=True)
    if failed_asins:
        print(f"Failed ASINs: {', '.join(failed_asins[:30])}", flush=True)

    # Data quality
    total_with_price = sum(1 for p in products if p.get("price") and "$" in str(p.get("price", "")) and not str(p.get("price", "")).endswith("."))
    total_with_image = sum(1 for p in products if p.get("imageUrl") and "amazon" in str(p.get("imageUrl", "")))
    total_with_rating = sum(1 for p in products if p.get("rating") is not None)

    print(f"\nData Quality:", flush=True)
    print(f"  Valid price: {total_with_price}/{len(products)} ({total_with_price*100//max(len(products),1)}%)", flush=True)
    print(f"  Amazon image: {total_with_image}/{len(products)} ({total_with_image*100//max(len(products),1)}%)", flush=True)
    print(f"  Rating: {total_with_rating}/{len(products)} ({total_with_rating*100//max(len(products),1)}%)", flush=True)

    if failed_asins:
        failed_file = SCRIPT_DIR / "failed_asins.json"
        with open(failed_file, "w") as f:
            json.dump(failed_asins, f, indent=2)
        print(f"\nFailed ASINs saved to {failed_file}", flush=True)

    return failed_asins


if __name__ == "__main__":
    failed = main()
    sys.exit(0 if not failed else 1)
