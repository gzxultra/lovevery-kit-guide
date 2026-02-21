#!/usr/bin/env python3
"""
Batch verify Amazon URLs by making HTTP HEAD requests.
Checks if each URL returns a valid product page (200) or is broken (404/redirect to search).
"""
import json
import requests
import time
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

with open('/home/ubuntu/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
    data = json.load(f)

all_links = []
for kit in data:
    kit_id = kit['kitId']
    for toy in kit['toys']:
        toy_name = toy['toyName']
        for alt in toy['alternatives']:
            all_links.append({
                'kit_id': kit_id,
                'toy_name': toy_name,
                'alt_name': alt['name'],
                'asin': alt.get('asin', ''),
                'url': alt.get('amazonUrl', ''),
                'price': alt.get('price', ''),
                'imageUrl': alt.get('imageUrl', ''),
            })

print(f"Total links to verify: {len(all_links)}")
print()

# Collect unique ASINs to avoid duplicate checks
unique_asins = {}
for link in all_links:
    asin = link['asin']
    if asin not in unique_asins:
        unique_asins[asin] = link

print(f"Unique ASINs to check: {len(unique_asins)}")
print()

broken = []
working = []
errors = []

for i, (asin, link) in enumerate(unique_asins.items()):
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        final_url = resp.url
        status = resp.status_code
        
        # Check if it's a dog page (Amazon's 404)
        is_dog_page = 'SORRY' in resp.text[:5000] or "we couldn't find that page" in resp.text[:5000].lower()
        # Check if redirected to search or homepage
        is_search_redirect = '/s?' in final_url or '/s/' in final_url
        is_homepage = final_url.rstrip('/') in ['https://www.amazon.com', 'http://www.amazon.com']
        
        # Check for "Currently unavailable" 
        is_unavailable = 'Currently unavailable' in resp.text[:10000]
        
        if status == 200 and not is_dog_page and not is_search_redirect and not is_homepage:
            status_str = "OK"
            if is_unavailable:
                status_str = "UNAVAILABLE"
                broken.append((asin, link, "Currently unavailable"))
            else:
                working.append(asin)
        else:
            reason = f"status={status}"
            if is_dog_page:
                reason = "404 Dog Page"
            elif is_search_redirect:
                reason = f"Redirected to search: {final_url[:80]}"
            elif is_homepage:
                reason = "Redirected to homepage"
            broken.append((asin, link, reason))
            status_str = f"BROKEN ({reason})"
        
        print(f"  [{i+1}/{len(unique_asins)}] {asin} - {status_str} - {link['alt_name'][:50]}")
        
    except Exception as e:
        errors.append((asin, link, str(e)))
        print(f"  [{i+1}/{len(unique_asins)}] {asin} - ERROR: {e} - {link['alt_name'][:50]}")
    
    # Small delay to avoid rate limiting
    time.sleep(0.5)

print(f"\n{'='*60}")
print(f"Results: {len(working)} working, {len(broken)} broken, {len(errors)} errors")
print(f"{'='*60}")

if broken:
    print(f"\nBROKEN LINKS ({len(broken)}):")
    for asin, link, reason in broken:
        print(f"  ASIN: {asin}")
        print(f"  Name: {link['alt_name']}")
        print(f"  Kit: {link['kit_id']}, Toy: {link['toy_name']}")
        print(f"  Reason: {reason}")
        print()

if errors:
    print(f"\nERRORS ({len(errors)}):")
    for asin, link, err in errors:
        print(f"  ASIN: {asin}")
        print(f"  Name: {link['alt_name']}")
        print(f"  Error: {err}")
        print()

# Save results to file
results = {
    'total': len(unique_asins),
    'working': len(working),
    'broken': [(a, l['alt_name'], l['kit_id'], l['toy_name'], r) for a, l, r in broken],
    'errors': [(a, l['alt_name'], e) for a, l, e in errors],
    'working_asins': working,
}

with open('/home/ubuntu/loveveryfans/scripts/url_verification_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nResults saved to scripts/url_verification_results.json")
