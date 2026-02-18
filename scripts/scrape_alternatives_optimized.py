#!/usr/bin/env python3
"""
Lovevery Play Kit Amazon Alternatives Scraper (OPTIMIZED)

This script searches for affordable Amazon alternatives for each toy in the
Lovevery Play Kit lineup. It uses AI to find product recommendations, then
scrapes real Amazon data (price, rating, reviews, images) for accuracy.

OPTIMIZATIONS:
- Realistic browser simulation with User-Agent rotation
- Session management with cookie persistence
- Exponential backoff retry mechanism
- Improved data extraction with multiple selector fallbacks
- Detailed success rate tracking and logging
- Error isolation (single product failures don't affect others)
- Better rate limiting with jitter

Usage:
    python3 scrape_alternatives_optimized.py [--kit KIT_ID] [--output OUTPUT_FILE]

Options:
    --kit KIT_ID        Only scrape alternatives for a specific kit (e.g., "looker")
    --output FILE       Output JSON file path (default: lovevery_alternatives.json)
    --update            Update existing data instead of overwriting
    --refresh-prices    Refresh prices/ratings for existing ASINs without AI search
    --verbose           Print detailed progress information
    --stats             Print detailed statistics at the end

Requirements:
    pip3 install requests beautifulsoup4 openai

Environment:
    OPENAI_API_KEY      Required for AI-powered product search (not for price updates)
"""

import argparse
import json
import os
import sys
import time
import re
import random
from pathlib import Path
from typing import Optional, Dict, List
from dataclasses import dataclass, field
from datetime import datetime

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
BASE_DELAY = 3.0  # base seconds between Amazon requests
MAX_JITTER = 2.0  # random jitter added to delay
MAX_ALTERNATIVES_PER_TOY = 3
MIN_RATING = 4.0
MIN_REVIEWS = 50
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 2.0  # seconds
MAX_RETRY_DELAY = 60.0  # seconds

# Amazon affiliate tag
AFFILIATE_TAG = "loveveryfans-20"

# Realistic User-Agent strings (rotate to avoid detection)
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# Base headers (User-Agent will be added per request)
BASE_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
}


# ============================================================================
# Statistics Tracking
# ============================================================================

@dataclass
class ScraperStats:
    """Track scraping statistics for reporting."""
    total_attempts: int = 0
    successful_scrapes: int = 0
    failed_scrapes: int = 0
    status_codes: Dict[int, int] = field(default_factory=dict)
    failure_reasons: Dict[str, int] = field(default_factory=dict)
    products_with_price: int = 0
    products_with_rating: int = 0
    products_with_reviews: int = 0
    products_with_image: int = 0
    total_retries: int = 0
    start_time: float = field(default_factory=time.time)
    
    def record_attempt(self):
        self.total_attempts += 1
    
    def record_success(self, has_price: bool, has_rating: bool, 
                      has_reviews: bool, has_image: bool):
        self.successful_scrapes += 1
        if has_price:
            self.products_with_price += 1
        if has_rating:
            self.products_with_rating += 1
        if has_reviews:
            self.products_with_reviews += 1
        if has_image:
            self.products_with_image += 1
    
    def record_failure(self, reason: str):
        self.failed_scrapes += 1
        self.failure_reasons[reason] = self.failure_reasons.get(reason, 0) + 1
    
    def record_status_code(self, code: int):
        self.status_codes[code] = self.status_codes.get(code, 0) + 1
    
    def record_retry(self):
        self.total_retries += 1
    
    def get_success_rate(self) -> float:
        if self.total_attempts == 0:
            return 0.0
        return (self.successful_scrapes / self.total_attempts) * 100
    
    def get_elapsed_time(self) -> float:
        return time.time() - self.start_time
    
    def print_report(self):
        """Print detailed statistics report."""
        print("\n" + "="*70)
        print("SCRAPER STATISTICS REPORT")
        print("="*70)
        print(f"Total scraping attempts:     {self.total_attempts}")
        print(f"Successful scrapes:          {self.successful_scrapes} ({self.get_success_rate():.1f}%)")
        print(f"Failed scrapes:              {self.failed_scrapes}")
        print(f"Total retries performed:     {self.total_retries}")
        print(f"Elapsed time:                {self.get_elapsed_time():.1f}s")
        
        if self.successful_scrapes > 0:
            print(f"\nData Quality:")
            print(f"  Products with price:       {self.products_with_price}/{self.successful_scrapes} ({self.products_with_price*100//self.successful_scrapes}%)")
            print(f"  Products with rating:      {self.products_with_rating}/{self.successful_scrapes} ({self.products_with_rating*100//self.successful_scrapes}%)")
            print(f"  Products with reviews:     {self.products_with_reviews}/{self.successful_scrapes} ({self.products_with_reviews*100//self.successful_scrapes}%)")
            print(f"  Products with image:       {self.products_with_image}/{self.successful_scrapes} ({self.products_with_image*100//self.successful_scrapes}%)")
        
        if self.status_codes:
            print(f"\nHTTP Status Codes:")
            for code, count in sorted(self.status_codes.items()):
                print(f"  {code}: {count}")
        
        if self.failure_reasons:
            print(f"\nFailure Reasons:")
            for reason, count in sorted(self.failure_reasons.items(), 
                                       key=lambda x: x[1], reverse=True):
                print(f"  {reason}: {count}")
        
        print("="*70 + "\n")


# Global stats object
STATS = ScraperStats()


# ============================================================================
# Session Management
# ============================================================================

class AmazonSession:
    """Manages a persistent session with Amazon, including cookies and headers."""
    
    def __init__(self):
        self.session = requests.Session()
        self._setup_session()
    
    def _setup_session(self):
        """Initialize session with realistic settings."""
        # Set default headers
        self.session.headers.update(BASE_HEADERS)
        
        # Enable cookie persistence
        self.session.cookies.set('session-id', f'000-0000000-{random.randint(1000000, 9999999)}')
        self.session.cookies.set('session-id-time', str(int(time.time())))
        
        # Disable SSL warnings (optional, for debugging)
        # requests.packages.urllib3.disable_warnings()
    
    def get_random_headers(self) -> dict:
        """Get headers with random User-Agent."""
        headers = BASE_HEADERS.copy()
        headers["User-Agent"] = random.choice(USER_AGENTS)
        return headers
    
    def get(self, url: str, **kwargs) -> requests.Response:
        """Make a GET request with the session."""
        headers = self.get_random_headers()
        return self.session.get(url, headers=headers, **kwargs)


# Global session object
SESSION = AmazonSession()


# ============================================================================
# Amazon Data Scraping (OPTIMIZED)
# ============================================================================

def exponential_backoff_delay(attempt: int) -> float:
    """Calculate delay with exponential backoff and jitter."""
    delay = min(INITIAL_RETRY_DELAY * (2 ** attempt), MAX_RETRY_DELAY)
    jitter = random.uniform(0, delay * 0.3)  # Add 0-30% jitter
    return delay + jitter


def extract_price(soup: BeautifulSoup) -> Optional[str]:
    """Extract price with multiple fallback selectors."""
    price_selectors = [
        # Primary price locations
        ('span', {'class': 'a-price-whole'}),
        ('span', {'class': 'a-offscreen'}),
        ('span', {'id': 'priceblock_ourprice'}),
        ('span', {'id': 'priceblock_dealprice'}),
        ('span', {'id': 'priceblock_saleprice'}),
        ('span', {'class': 'a-color-price'}),
        # Alternative locations
        ('span', {'class': 'apexPriceToPay'}),
        ('div', {'id': 'corePrice_feature_div'}),
        ('div', {'id': 'corePriceDisplay_desktop_feature_div'}),
    ]
    
    for tag, attrs in price_selectors:
        elements = soup.find_all(tag, attrs)
        for elem in elements:
            price_text = elem.get_text().strip()
            # Extract numeric price
            price_match = re.search(r'\$?(\d+\.?\d*)', price_text)
            if price_match:
                price_val = price_match.group(1)
                # Validate it's a reasonable price (not a year or other number)
                try:
                    if 0.01 <= float(price_val) <= 9999:
                        return f"${price_val}"
                except ValueError:
                    continue
    
    return None


def extract_rating(soup: BeautifulSoup) -> Optional[float]:
    """Extract rating with multiple fallback selectors."""
    rating_selectors = [
        ('span', {'class': 'a-icon-alt'}),
        ('span', {'id': 'acrPopover'}),
        ('i', {'class': 'a-icon-star'}),
    ]
    
    for tag, attrs in rating_selectors:
        elements = soup.find_all(tag, attrs)
        for elem in elements:
            rating_text = elem.get_text().strip()
            # Look for "X.X out of 5" pattern
            rating_match = re.search(r'(\d+\.?\d*)\s*(?:out of|stars?)', rating_text, re.IGNORECASE)
            if rating_match:
                try:
                    rating = float(rating_match.group(1))
                    if 0 <= rating <= 5:
                        return rating
                except ValueError:
                    continue
    
    return None


def extract_review_count(soup: BeautifulSoup) -> Optional[int]:
    """Extract review count with multiple fallback selectors."""
    review_patterns = [
        (r'([\d,]+)\s*(?:global\s+)?ratings?', soup.find_all('span', class_='a-size-base')),
        (r'([\d,]+)\s*ratings?', soup.find_all('span', id='acrCustomerReviewText')),
        (r'([\d,]+)\s*customer\s+reviews?', soup.find_all('span')),
        (r'([\d,]+)\s*reviews?', soup.find_all('a', href=re.compile(r'#customerReviews'))),
    ]
    
    for pattern, elements in review_patterns:
        for elem in elements:
            text = elem.get_text().strip()
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    count = int(match.group(1).replace(',', ''))
                    if count > 0:
                        return count
                except ValueError:
                    continue
    
    return None


def extract_image_url(soup: BeautifulSoup) -> Optional[str]:
    """Extract main product image with multiple fallback methods."""
    # Method 1: landingImage (most reliable)
    img = soup.find('img', {'id': 'landingImage'})
    if img:
        url = img.get('data-old-hires') or img.get('src')
        if url:
            return clean_image_url(url)
    
    # Method 2: imgTagWrapperId div
    wrapper = soup.find('div', {'id': 'imgTagWrapperId'})
    if wrapper:
        img = wrapper.find('img')
        if img:
            url = img.get('data-old-hires') or img.get('src')
            if url:
                return clean_image_url(url)
    
    # Method 3: Any a-dynamic-image
    imgs = soup.find_all('img', class_='a-dynamic-image')
    for img in imgs:
        url = img.get('data-old-hires') or img.get('src')
        if url and 'sprite' not in url.lower():
            return clean_image_url(url)
    
    # Method 4: JSON-LD structured data
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string)
            if isinstance(data, dict) and 'image' in data:
                image = data['image']
                if isinstance(image, str):
                    return clean_image_url(image)
                elif isinstance(image, list) and len(image) > 0:
                    return clean_image_url(image[0])
        except (json.JSONDecodeError, AttributeError):
            continue
    
    # Method 5: og:image meta tag
    og_image = soup.find('meta', property='og:image')
    if og_image and og_image.get('content'):
        return clean_image_url(og_image['content'])
    
    return None


def clean_image_url(url: str) -> str:
    """Clean up image URL to get highest quality version."""
    # Remove size parameters (._SL500_, ._AC_UL320_, etc.)
    url = re.sub(r'\._[A-Z]{2}\d+_\.', '.', url)
    url = re.sub(r'\._.*?_\.', '.', url)
    
    # Ensure HTTPS
    if url.startswith('//'):
        url = 'https:' + url
    elif url.startswith('http://'):
        url = url.replace('http://', 'https://')
    
    return url


def scrape_amazon_product(asin: str, verbose: bool = False) -> Optional[dict]:
    """
    Scrape real product data from Amazon product page with improved reliability.
    
    Returns dict with: price, rating, reviewCount, imageUrl, or None if failed.
    """
    url = f"https://www.amazon.com/dp/{asin}"
    
    STATS.record_attempt()
    
    for attempt in range(MAX_RETRIES):
        try:
            if verbose:
                print(f"      Fetching Amazon page for ASIN {asin} (attempt {attempt + 1}/{MAX_RETRIES})...")
            
            # Apply delay with jitter
            if attempt == 0:
                delay = BASE_DELAY + random.uniform(0, MAX_JITTER)
            else:
                delay = exponential_backoff_delay(attempt - 1)
                STATS.record_retry()
            
            time.sleep(delay)
            
            # Make request with session
            response = SESSION.get(url, timeout=20)
            STATS.record_status_code(response.status_code)
            
            # Handle different status codes
            if response.status_code == 503:
                if verbose:
                    print(f"      Amazon returned 503 (rate limited), backing off...")
                if attempt < MAX_RETRIES - 1:
                    continue
                else:
                    STATS.record_failure("503_rate_limited")
                    return None
            
            if response.status_code == 404:
                if verbose:
                    print(f"      Product not found (404)")
                STATS.record_failure("404_not_found")
                return None
            
            if response.status_code >= 500:
                if verbose:
                    print(f"      Server error ({response.status_code}), retrying...")
                if attempt < MAX_RETRIES - 1:
                    continue
                else:
                    STATS.record_failure(f"{response.status_code}_server_error")
                    return None
            
            if response.status_code != 200:
                if verbose:
                    print(f"      Unexpected status code {response.status_code}")
                if attempt < MAX_RETRIES - 1:
                    continue
                else:
                    STATS.record_failure(f"{response.status_code}_unexpected")
                    return None
            
            # Check if we got a CAPTCHA or bot detection page
            if 'api-services-support@amazon.com' in response.text or 'Robot Check' in response.text:
                if verbose:
                    print(f"      Bot detection triggered, backing off...")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(30)  # Long delay before retry
                    continue
                else:
                    STATS.record_failure("bot_detection")
                    return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract all data fields
            price = extract_price(soup)
            rating = extract_rating(soup)
            review_count = extract_review_count(soup)
            image_url = extract_image_url(soup)
            
            # Validate we got at least some data
            if not price and not rating:
                if verbose:
                    print(f"      Could not extract price or rating from page")
                if attempt < MAX_RETRIES - 1:
                    continue
                else:
                    STATS.record_failure("no_data_extracted")
                    return None
            
            result = {
                'price': price,
                'rating': rating,
                'reviewCount': review_count,
                'imageUrl': image_url,
            }
            
            # Record success statistics
            STATS.record_success(
                has_price=bool(price),
                has_rating=bool(rating),
                has_reviews=bool(review_count),
                has_image=bool(image_url)
            )
            
            if verbose:
                print(f"      ✓ Scraped: price={price}, rating={rating}, reviews={review_count}, image={bool(image_url)}")
            
            return result
            
        except requests.exceptions.Timeout:
            if verbose:
                print(f"      Request timeout, retrying...")
            STATS.record_retry()
            if attempt == MAX_RETRIES - 1:
                STATS.record_failure("timeout")
            continue
            
        except requests.exceptions.ConnectionError:
            if verbose:
                print(f"      Connection error, retrying...")
            STATS.record_retry()
            if attempt == MAX_RETRIES - 1:
                STATS.record_failure("connection_error")
            continue
            
        except Exception as e:
            if verbose:
                print(f"      Error scraping Amazon: {type(e).__name__}: {e}")
            if attempt == MAX_RETRIES - 1:
                STATS.record_failure(f"exception_{type(e).__name__}")
            continue
    
    if verbose:
        print(f"      ✗ Failed to scrape after {MAX_RETRIES} attempts")
    return None


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
    """
    Use OpenAI API to find Amazon alternatives (ASINs only).
    Real prices/ratings will be scraped separately.
    """
    if not HAS_OPENAI:
        return []

    client = OpenAI()

    prompt = f"""Find 1-3 high-quality, affordable Amazon alternatives for this Lovevery toy:

Toy: {toy_name}
Category: {toy_category}
From Kit: {kit_name}

Requirements:
- Must be available on Amazon US
- Safe materials (BPA-free, non-toxic)
- Similar developmental purpose
- Good value for money

For each alternative, provide:
1. Product name (as listed on Amazon)
2. ASIN (the 10-character Amazon product ID, format: B0XXXXXXXXX or B00XXXXXXX)
3. Brief reason why it's a good alternative (in English)
4. Brief reason in Chinese

Return ONLY a JSON array (no markdown, no explanation):
[
  {{
    "name": "Product Name",
    "asin": "B0XXXXXXXXX",
    "reasonEn": "English reason",
    "reasonCn": "中文原因"
  }}
]

IMPORTANT: Do NOT include price, rating, or reviewCount - we will scrape those separately.
If you cannot find suitable alternatives, return an empty array: []
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that finds Amazon product alternatives for baby/toddler toys. Always return valid JSON arrays only. Do not include prices or ratings.",
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
    refresh_prices: bool = False,
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
            print(f"  [{i+1}/{len(kit['toys'])}] Processing: {toy_name}")

        # Check if we already have data for this toy
        existing_toy = None
        if existing_data:
            existing_toy = next(
                (t for t in existing_data.get("toys", []) if t["toyName"] == toy_name),
                None,
            )

        alternatives = []

        if refresh_prices and existing_toy and existing_toy.get("alternatives"):
            # Refresh mode: keep existing ASINs, just update prices/ratings
            if verbose:
                print(f"    Refreshing prices for {len(existing_toy['alternatives'])} existing alternatives")
            
            for alt in existing_toy["alternatives"]:
                asin = alt.get("asin")
                if not asin:
                    continue
                
                # Scrape real Amazon data
                amazon_data = scrape_amazon_product(asin, verbose=verbose)
                
                if amazon_data:
                    # Update with real data
                    updated_alt = {
                        "name": alt.get("name", ""),
                        "asin": asin,
                        "price": amazon_data.get("price") or alt.get("price"),
                        "rating": amazon_data.get("rating") or alt.get("rating"),
                        "reviewCount": amazon_data.get("reviewCount") or alt.get("reviewCount"),
                        "imageUrl": amazon_data.get("imageUrl") or alt.get("imageUrl"),
                        "amazonUrl": f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}",
                        "reasonEn": alt.get("reasonEn", ""),
                        "reasonCn": alt.get("reasonCn", ""),
                    }
                    alternatives.append(updated_alt)
                else:
                    # Keep existing data if scraping failed
                    alternatives.append(alt)
        
        elif existing_toy and existing_toy.get("alternatives") and not refresh_prices:
            # Use existing data without refresh
            if verbose:
                print(f"    Using existing data ({len(existing_toy['alternatives'])} alternatives)")
            alternatives = existing_toy["alternatives"]
        
        else:
            # Search for new alternatives with AI
            if verbose:
                print(f"    Searching for new alternatives...")
            
            ai_alternatives = search_alternatives_with_ai(toy_name, category, kit_name)
            
            for alt in ai_alternatives:
                asin = alt.get("asin")
                if not asin:
                    continue
                
                # Scrape real Amazon data
                amazon_data = scrape_amazon_product(asin, verbose=verbose)
                
                if amazon_data:
                    # Combine AI metadata with real scraped data
                    full_alt = {
                        "name": alt.get("name", ""),
                        "asin": asin,
                        "price": amazon_data.get("price", "N/A"),
                        "rating": amazon_data.get("rating"),
                        "reviewCount": amazon_data.get("reviewCount"),
                        "imageUrl": amazon_data.get("imageUrl"),
                        "amazonUrl": f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}",
                        "reasonEn": alt.get("reasonEn", ""),
                        "reasonCn": alt.get("reasonCn", ""),
                    }
                    alternatives.append(full_alt)
                else:
                    if verbose:
                        print(f"      Skipping {asin} - could not scrape data")

        toy_result = {
            "toyName": toy_name,
            "toyNameCn": toy_cn,
            "alternatives": alternatives,
        }
        result["toys"].append(toy_result)

        if verbose:
            print(f"    ✓ Total alternatives: {len(alternatives)}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Amazon alternatives for Lovevery Play Kit toys (OPTIMIZED)"
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
        "--refresh-prices",
        action="store_true",
        help="Refresh prices/ratings for existing ASINs (no AI search needed)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress",
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Print detailed statistics at the end",
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
    if (args.update or args.refresh_prices) and os.path.exists(args.output):
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
        result = scrape_kit_alternatives(
            kit, 
            existing_kit, 
            refresh_prices=args.refresh_prices,
            verbose=args.verbose
        )
        results.append(result)

    # If updating, merge with existing data
    if (args.update or args.refresh_prices) and existing_data:
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
    
    # Count how many have images
    alts_with_images = sum(
        1 for k in results 
        for t in k["toys"] 
        for a in t.get("alternatives", [])
        if a.get("imageUrl")
    )

    print(f"\n{'='*50}")
    print(f"Scraping Complete!")
    print(f"{'='*50}")
    print(f"Kits processed: {len(results)}")
    print(f"Total toys: {total_toys}")
    print(f"Total alternatives found: {total_alts}")
    print(f"Alternatives with images: {alts_with_images}/{total_alts} ({alts_with_images*100//max(total_alts,1)}%)")
    print(f"Toys with alternatives: {toys_with_alts} ({toys_with_alts*100//max(total_toys,1)}%)")
    print(f"Output saved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.1f} KB")
    
    # Print detailed statistics if requested
    if args.stats or args.verbose:
        STATS.print_report()


if __name__ == "__main__":
    main()
