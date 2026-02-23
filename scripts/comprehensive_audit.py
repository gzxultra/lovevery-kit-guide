#!/usr/bin/env python3
"""Comprehensive audit of all Amazon affiliate items in lovevery_alternatives.json"""

import json
import re
from collections import defaultdict

def main():
    with open('/Users/gzxultra/Dev/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
        data = json.load(f)

    total_items = 0
    issues = {
        'missing_image': [],
        'non_amazon_image': [],
        'invalid_amazon_image': [],
        'reused_generic_image': [],
        'missing_price': [],
        'missing_rating': [],
        'missing_review_count': [],
        'asin_url_mismatch': [],
        'invalid_asin_format': [],
        'duplicate_asin': [],
        'wrong_product_name': [],
        'missing_affiliate_tag': [],
    }

    asin_usage = defaultdict(list)
    image_usage = defaultdict(list)

    # Known generic/placeholder images (used across many unrelated products)
    GENERIC_IMAGES = {
        '81Vy4dkSJML._SL1500_.jpg',
        '81Vy4dkSJML._SL1500_.jpg',
    }

    for kit in data:
        kit_name = kit['kitName']
        kit_id = kit['kitId']
        for toy in kit['toys']:
            toy_name = toy['toyName']
            for alt in toy.get('alternatives', []):
                total_items += 1
                loc = f"{kit_name} > {toy_name} > {alt['name'][:50]}"
                asin = alt.get('asin', '')
                url = alt.get('amazonUrl', '')
                image = alt.get('imageUrl', '')
                price = alt.get('price')
                rating = alt.get('rating')
                review_count = alt.get('reviewCount')

                # Track ASIN usage
                asin_usage[asin].append(loc)

                # Track image usage
                if image:
                    img_file = image.split('/')[-1].split('?')[0]
                    image_usage[img_file].append(loc)

                # Check 1: Missing image
                if not image:
                    issues['missing_image'].append({
                        'location': loc,
                        'asin': asin,
                        'kit': kit_name,
                        'toy': toy_name,
                    })

                # Check 2: Non-Amazon image URL
                elif 'media-amazon.com' not in image and 'amazon.com' not in image:
                    domain = re.search(r'https?://([^/]+)', image)
                    issues['non_amazon_image'].append({
                        'location': loc,
                        'asin': asin,
                        'image_url': image,
                        'domain': domain.group(1) if domain else 'unknown',
                    })

                # Check 3: Invalid Amazon image format (ASIN used as image ID)
                elif 'media-amazon.com' in image:
                    img_id = image.split('/')[-1].split('.')[0]
                    # Valid Amazon image IDs are like 71S8CVAxgWL, not ASINs
                    if re.match(r'^B[0-9A-Z]{9}$', img_id):
                        issues['invalid_amazon_image'].append({
                            'location': loc,
                            'asin': asin,
                            'image_url': image,
                            'issue': f'Image ID "{img_id}" looks like an ASIN, not a valid image ID',
                        })

                # Check 4: Missing price
                if price is None:
                    issues['missing_price'].append({
                        'location': loc,
                        'asin': asin,
                    })

                # Check 5: Missing rating
                if rating is None:
                    issues['missing_rating'].append({
                        'location': loc,
                        'asin': asin,
                    })

                # Check 6: Missing review count
                if review_count is None:
                    issues['missing_review_count'].append({
                        'location': loc,
                        'asin': asin,
                    })

                # Check 7: ASIN/URL mismatch
                url_asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
                if url_asin_match:
                    url_asin = url_asin_match.group(1)
                    if url_asin != asin:
                        issues['asin_url_mismatch'].append({
                            'location': loc,
                            'field_asin': asin,
                            'url_asin': url_asin,
                            'url': url,
                        })

                # Check 8: Invalid ASIN format
                if not re.match(r'^[A-Z0-9]{10}$', asin):
                    issues['invalid_asin_format'].append({
                        'location': loc,
                        'asin': asin,
                        'issue': 'ASIN should be 10 alphanumeric chars',
                    })

                # Check 9: Missing affiliate tag
                if 'tag=loveveryfans-20' not in url:
                    issues['missing_affiliate_tag'].append({
                        'location': loc,
                        'asin': asin,
                        'url': url,
                    })

    # Check 10: Duplicate ASINs (same ASIN for different toys in different kits)
    for asin, locations in asin_usage.items():
        if len(locations) > 1:
            issues['duplicate_asin'].append({
                'asin': asin,
                'count': len(locations),
                'locations': locations,
            })

    # Check 11: Reused generic images
    for img, locations in image_usage.items():
        if len(locations) > 2 or img in GENERIC_IMAGES:
            if len(locations) > 1:
                issues['reused_generic_image'].append({
                    'image': img,
                    'count': len(locations),
                    'locations': locations,
                })

    # Print report
    print(f"\n{'='*80}")
    print(f"COMPREHENSIVE AFFILIATE ITEM AUDIT REPORT")
    print(f"{'='*80}")
    print(f"\nTotal items audited: {total_items}")
    print(f"Total issues found: {sum(len(v) for v in issues.values())}")

    for issue_type, items in issues.items():
        if items:
            print(f"\n{'─'*80}")
            print(f"  {issue_type.upper().replace('_', ' ')} ({len(items)} issues)")
            print(f"{'─'*80}")
            for item in items:
                if issue_type == 'duplicate_asin':
                    print(f"  ASIN {item['asin']} used {item['count']} times:")
                    for loc in item['locations']:
                        print(f"    - {loc}")
                elif issue_type == 'reused_generic_image':
                    print(f"  Image {item['image']} used {item['count']} times:")
                    for loc in item['locations']:
                        print(f"    - {loc}")
                elif issue_type == 'non_amazon_image':
                    print(f"  [{item['asin']}] {item['location']}")
                    print(f"    Domain: {item['domain']}")
                    print(f"    URL: {item['image_url']}")
                elif issue_type == 'invalid_amazon_image':
                    print(f"  [{item['asin']}] {item['location']}")
                    print(f"    {item['issue']}")
                elif issue_type == 'asin_url_mismatch':
                    print(f"  [{item.get('field_asin', item.get('asin', '?'))}] {item['location']}")
                    print(f"    Field ASIN: {item['field_asin']}, URL ASIN: {item['url_asin']}")
                else:
                    print(f"  [{item['asin']}] {item['location']}")

    # Generate list of all items needing Amazon lookup
    items_needing_lookup = set()
    for issue_type in ['missing_image', 'non_amazon_image', 'invalid_amazon_image',
                       'missing_price', 'missing_rating', 'missing_review_count']:
        for item in issues[issue_type]:
            items_needing_lookup.add(item['asin'])

    print(f"\n{'='*80}")
    print(f"ITEMS NEEDING AMAZON LOOKUP: {len(items_needing_lookup)}")
    print(f"{'='*80}")
    for asin in sorted(items_needing_lookup):
        print(f"  https://www.amazon.com/dp/{asin}")

    # Save detailed report
    report = {
        'total_items': total_items,
        'total_issues': sum(len(v) for v in issues.values()),
        'issues': {k: v for k, v in issues.items() if v},
        'items_needing_lookup': sorted(items_needing_lookup),
    }
    with open('/Users/gzxultra/Dev/loveveryfans/scripts/comprehensive_audit_report.json', 'w') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\nDetailed report saved to comprehensive_audit_report.json")

if __name__ == '__main__':
    main()
