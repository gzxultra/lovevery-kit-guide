#!/usr/bin/env python3
"""
Extract all Amazon URLs from lovevery_alternatives.json and output them for verification.
"""
import json
import re

with open('/home/ubuntu/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
    data = json.load(f)

all_links = []
for kit in data:
    kit_id = kit['kitId']
    kit_name = kit['kitName']
    for toy in kit['toys']:
        toy_name = toy['toyName']
        for alt in toy['alternatives']:
            name = alt['name']
            asin = alt.get('asin', '')
            url = alt.get('amazonUrl', '')
            price = alt.get('price', '')
            image = alt.get('imageUrl', '')
            all_links.append({
                'kit_id': kit_id,
                'kit_name': kit_name,
                'toy_name': toy_name,
                'alt_name': name,
                'asin': asin,
                'url': url,
                'price': price,
                'has_image': bool(image),
            })

print(f"Total alternatives found: {len(all_links)}")
print()

# Check URL format issues
issues = []
for i, link in enumerate(all_links):
    url = link['url']
    asin = link['asin']
    problems = []
    
    if not url:
        problems.append("MISSING URL")
    elif not url.startswith('https://www.amazon.com/'):
        problems.append(f"BAD URL PREFIX: {url[:50]}")
    
    if not asin:
        problems.append("MISSING ASIN")
    elif len(asin) != 10:
        problems.append(f"BAD ASIN LENGTH ({len(asin)}): {asin}")
    
    # Check if URL contains the ASIN
    if url and asin and asin not in url:
        problems.append(f"ASIN {asin} NOT IN URL")
    
    # Check affiliate tag
    if url and 'tag=loveveryfans-20' not in url:
        problems.append("MISSING AFFILIATE TAG")
    
    # Check price format
    price = link['price']
    if price and price.endswith('.'):
        problems.append(f"BAD PRICE FORMAT: {price}")
    
    if problems:
        issues.append((i, link, problems))

print(f"Links with format issues: {len(issues)}")
for i, link, problems in issues:
    print(f"  [{i}] {link['alt_name']}")
    print(f"       Kit: {link['kit_id']}, Toy: {link['toy_name']}")
    print(f"       URL: {link['url']}")
    print(f"       ASIN: {link['asin']}")
    print(f"       Problems: {', '.join(problems)}")
    print()

# Output all URLs for batch verification
print("\n=== ALL AMAZON URLs ===")
for i, link in enumerate(all_links):
    print(f"{i}|{link['asin']}|{link['url']}|{link['alt_name']}")
