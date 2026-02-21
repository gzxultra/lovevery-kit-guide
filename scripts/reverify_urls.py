#!/usr/bin/env python3
"""
Re-verify all Amazon URLs after the ASIN update.
Focus on the ones that were previously broken.
"""
import json
import requests
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

with open('/home/ubuntu/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
    data = json.load(f)

# Collect unique ASINs
unique_asins = {}
for kit in data:
    for toy in kit['toys']:
        for alt in toy['alternatives']:
            asin = alt.get('asin', '')
            if asin and asin not in unique_asins:
                unique_asins[asin] = {
                    'name': alt['name'],
                    'kit': kit['kitId'],
                    'toy': toy['toyName'],
                    'url': alt.get('amazonUrl', ''),
                }

print(f"Unique ASINs to verify: {len(unique_asins)}")

broken = []
working = []

for i, (asin, info) in enumerate(unique_asins.items()):
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        final_url = resp.url
        status = resp.status_code
        
        is_dog_page = 'SORRY' in resp.text[:5000] or "we couldn't find that page" in resp.text[:5000].lower()
        is_search_redirect = '/s?' in final_url or '/s/' in final_url
        is_homepage = final_url.rstrip('/') in ['https://www.amazon.com', 'http://www.amazon.com']
        
        if status == 200 and not is_dog_page and not is_search_redirect and not is_homepage:
            working.append(asin)
            print(f"  [{i+1}/{len(unique_asins)}] ✅ {asin} - {info['name'][:50]}")
        else:
            reason = f"status={status}"
            if is_dog_page: reason = "404 Dog Page"
            elif is_search_redirect: reason = f"Search redirect"
            elif is_homepage: reason = "Homepage redirect"
            broken.append((asin, info, reason))
            print(f"  [{i+1}/{len(unique_asins)}] ❌ {asin} - {reason} - {info['name'][:50]}")
    except Exception as e:
        broken.append((asin, info, str(e)[:50]))
        print(f"  [{i+1}/{len(unique_asins)}] ❌ {asin} - ERROR: {str(e)[:50]} - {info['name'][:50]}")
    
    time.sleep(0.3)

print(f"\n{'='*60}")
print(f"Working: {len(working)}/{len(unique_asins)}")
print(f"Broken: {len(broken)}/{len(unique_asins)}")

if broken:
    print(f"\nSTILL BROKEN:")
    for asin, info, reason in broken:
        print(f"  {asin} | {info['kit']}/{info['toy']} | {info['name'][:50]} | {reason}")

# Save results
with open('/home/ubuntu/loveveryfans/scripts/reverify_results.json', 'w') as f:
    json.dump({
        'total': len(unique_asins),
        'working': len(working),
        'broken_count': len(broken),
        'broken': [(a, i['name'], i['kit'], i['toy'], r) for a, i, r in broken],
        'working_asins': working,
    }, f, indent=2)
