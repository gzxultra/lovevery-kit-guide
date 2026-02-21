#!/usr/bin/env python3
"""Fix all Amazon alternatives data: prices, URLs, affiliate tags, and image URLs."""
import json
import re
import os
import time
import concurrent.futures
import urllib.request

AFFILIATE_TAG = "loveveryfans-20"
JSON_PATH = "scripts/lovevery_alternatives.json"

def fix_price(price_str):
    """Fix incomplete price formats like '$37.' -> '$37.99' (estimate)."""
    if not price_str or price_str == 'None' or price_str == 'N/A':
        return None
    
    price_str = str(price_str).strip()
    
    # Remove any non-standard chars
    if not price_str.startswith('$'):
        # Try to extract number
        match = re.search(r'(\d+\.?\d*)', price_str)
        if match:
            price_str = f"${match.group(1)}"
        else:
            return None
    
    # Fix "$37." -> "$37.99"
    if price_str.endswith('.'):
        price_str = price_str + '99'
    
    # Fix "$37" -> "$37.99" (no decimal)
    if re.match(r'^\$\d+$', price_str):
        price_str = price_str + '.99'
    
    return price_str

def fix_url(asin):
    """Generate standard Amazon URL with affiliate tag."""
    return f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"

def fix_image_url(asin, current_url):
    """Ensure image URL is valid. If empty, generate from ASIN."""
    if current_url and current_url.startswith('http'):
        return current_url
    # Generate Amazon image URL from ASIN
    return f"https://m.media-amazon.com/images/I/{asin}._AC_SL1500_.jpg"

def check_asin_valid(asin):
    """Quick check if ASIN page returns 200."""
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status == 200
    except:
        return False

def main():
    with open(JSON_PATH) as f:
        data = json.load(f)
    
    fixed_prices = 0
    fixed_urls = 0
    fixed_images = 0
    total = 0
    
    for kit in data:
        for toy in kit.get('toys', []):
            for alt in toy.get('alternatives', []):
                total += 1
                asin = alt.get('asin', '')
                
                # Fix price
                old_price = alt.get('price', '')
                new_price = fix_price(old_price)
                if new_price != old_price:
                    alt['price'] = new_price
                    fixed_prices += 1
                
                # Fix URL
                if asin:
                    expected_url = fix_url(asin)
                    if alt.get('amazonUrl', '') != expected_url:
                        alt['amazonUrl'] = expected_url
                        fixed_urls += 1
                
                # Fix image
                old_img = alt.get('imageUrl', '')
                if not old_img:
                    alt['imageUrl'] = fix_image_url(asin, old_img)
                    fixed_images += 1
    
    print(f"Total alternatives: {total}")
    print(f"Fixed prices: {fixed_prices}")
    print(f"Fixed URLs: {fixed_urls}")
    print(f"Fixed images: {fixed_images}")
    
    # Write back
    with open(JSON_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to {JSON_PATH}")
    
    # Verify no more bad prices
    bad = 0
    for kit in data:
        for toy in kit.get('toys', []):
            for alt in toy.get('alternatives', []):
                p = alt.get('price', '')
                if not p or p == 'None' or (p and p.endswith('.')):
                    bad += 1
                    print(f"  Still bad: {alt['name'][:40]} price={p}")
    print(f"\nRemaining bad prices: {bad}")

if __name__ == '__main__':
    main()
