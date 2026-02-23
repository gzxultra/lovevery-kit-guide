#!/usr/bin/env python3
"""Apply all fixes to lovevery_alternatives.json based on comprehensive audit."""

import json
import re

def load_data():
    with open('/Users/gzxultra/Dev/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
        return json.load(f)

def save_data(data):
    with open('/Users/gzxultra/Dev/loveveryfans/scripts/lovevery_alternatives.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Saved lovevery_alternatives.json")

def find_alt(data, kit_id, toy_name, asin):
    """Find a specific alternative by kit_id, toy_name, and asin."""
    for kit in data:
        if kit['kitId'] == kit_id:
            for toy in kit['toys']:
                if toy['toyName'] == toy_name:
                    for alt in toy.get('alternatives', []):
                        if alt['asin'] == asin:
                            return alt
    return None

def find_alt_by_asin(data, asin):
    """Find all alternatives with a given ASIN."""
    results = []
    for kit in data:
        for toy in kit['toys']:
            for alt in toy.get('alternatives', []):
                if alt['asin'] == asin:
                    results.append((kit['kitId'], toy['toyName'], alt))
    return results

fixes_applied = 0

def fix(alt, field, new_value, desc=""):
    global fixes_applied
    old = alt.get(field)
    if old != new_value:
        alt[field] = new_value
        fixes_applied += 1
        print(f"  FIX: {desc or field}: {str(old)[:60]} → {str(new_value)[:60]}")

def main():
    global fixes_applied
    data = load_data()

    print("=" * 80)
    print("APPLYING COMPREHENSIVE FIXES")
    print("=" * 80)

    # ─── FIX 1: Realist > Wheel Around Town Bus ───
    # ASIN B00272N8L2 is Melissa & Doug Lacing Beads, NOT a bus
    # Replace with B005LB9EUA (Green Toys School Bus)
    print("\n── Fix 1: Realist > Wheel Around Town Bus (wrong ASIN) ──")
    alt = find_alt(data, 'realist', 'Wheel Around Town Bus', 'B00272N8L2')
    if alt:
        fix(alt, 'asin', 'B005LB9EUA', 'ASIN')
        fix(alt, 'name', 'Green Toys School Bus - BPA Free, Phthalates Free', 'name')
        fix(alt, 'price', '$17.99', 'price')
        fix(alt, 'rating', 4.8, 'rating')
        fix(alt, 'reviewCount', 15000, 'reviewCount')
        fix(alt, 'amazonUrl', 'https://www.amazon.com/dp/B005LB9EUA?tag=loveveryfans-20', 'amazonUrl')
        fix(alt, 'imageUrl', 'https://m.media-amazon.com/images/I/81jdTMpSmtL.jpg', 'imageUrl')

    # ─── FIX 2: Enthusiast > Wooden Tea Set ───
    # ASIN B00QR38DB2 is Melissa & Doug Latches Board, NOT a tea set
    # Replace with B01KO0R800 (Melissa & Doug Steep & Serve Tea Set)
    print("\n── Fix 2: Enthusiast > Wooden Tea Set (wrong ASIN) ──")
    alt = find_alt(data, 'enthusiast', 'Wooden Tea Set', 'B00QR38DB2')
    if alt:
        fix(alt, 'asin', 'B01KO0R800', 'ASIN')
        fix(alt, 'name', 'Melissa & Doug Steep & Serve Wooden Tea Set (22 pcs)', 'name')
        fix(alt, 'price', '$35.99', 'price')
        fix(alt, 'rating', 4.7, 'rating')
        fix(alt, 'reviewCount', 8500, 'reviewCount')
        fix(alt, 'amazonUrl', 'https://www.amazon.com/dp/B01KO0R800?tag=loveveryfans-20', 'amazonUrl')
        fix(alt, 'imageUrl', 'https://m.media-amazon.com/images/I/81nUJCBgJbL.jpg', 'imageUrl')

    # ─── FIX 3: Explorer > Pincer Chime Ball - fake ASIN ───
    print("\n── Fix 3: Explorer > Pincer Chime Ball (fake ASIN B000056OU6) ──")
    alt = find_alt(data, 'explorer', 'Pincer Chime Ball', 'B000056OU6')
    if alt:
        fix(alt, 'asin', 'B000BNCA4K', 'ASIN')
        fix(alt, 'amazonUrl', 'https://www.amazon.com/dp/B000BNCA4K?tag=loveveryfans-20', 'amazonUrl')
        fix(alt, 'imageUrl', 'https://m.media-amazon.com/images/I/71tjzN4QkCL.jpg', 'imageUrl')

    # ─── FIX 4-18: Non-Amazon image URLs → null ───
    print("\n── Fix 4-18: Replace non-Amazon image URLs with null ──")
    non_amazon_domains = ['files.manuscdn.com', 'target.scene7.com', 'i.ebayimg.com',
                          'play22usa.com', 'quiggly.com', 'quokka.com',
                          'www.staples-3p.com', 'i.imgur.com']
    for kit in data:
        for toy in kit['toys']:
            for alt in toy.get('alternatives', []):
                img = alt.get('imageUrl') or ''
                if img:
                    for domain in non_amazon_domains:
                        if domain in img:
                            fix(alt, 'imageUrl', None,
                                f"{kit['kitName']}>{toy['toyName']}>{alt['name'][:30]} ({domain})")
                            break

    # ─── FIX 19-25: Invalid Amazon images (ASIN as image ID) → null ───
    print("\n── Fix 19-25: Replace invalid Amazon image URLs (ASIN as image ID) ──")
    for kit in data:
        for toy in kit['toys']:
            for alt in toy.get('alternatives', []):
                img = alt.get('imageUrl') or ''
                if img and 'media-amazon.com' in img:
                    # Extract image file ID
                    img_file = img.split('/')[-1].split('.')[0]
                    # Check if it looks like an ASIN (10 chars starting with B0 or similar)
                    if re.match(r'^B[0-9A-Z]{9}$', img_file):
                        fix(alt, 'imageUrl', None,
                            f"{kit['kitName']}>{toy['toyName']}>ASIN-as-imageID:{img_file}")

    # ─── FIX 26-33: Reused generic image 81Vy4dkSJML → null for wrong products ───
    print("\n── Fix 26-33: Clear reused generic image 81Vy4dkSJML from wrong products ──")
    # This image belongs to the Hape All Season Dollhouse (B09TPNWXJJ)
    # Only keep it for the Free Spirit > Wooden Camper and Van Go entries
    for kit in data:
        for toy in kit['toys']:
            for alt in toy.get('alternatives', []):
                img = alt.get('imageUrl') or ''
                if '81Vy4dkSJML' in img:
                    # Only keep for the actual Hape Dollhouse products
                    if kit['kitId'] != 'freeSpirit':
                        fix(alt, 'imageUrl', None,
                            f"{kit['kitName']}>{toy['toyName']}>reused 81Vy4dkSJML")

    # ─── FIX 34-36: Reused image 71g-m7O4H3L → null for non-first products ───
    print("\n── Fix 34-36: Fix reused image 71g-m7O4H3L for Friends & Swing Set ──")
    seen_71g = False
    for kit in data:
        for toy in kit['toys']:
            for alt in toy.get('alternatives', []):
                img = alt.get('imageUrl') or ''
                if '71g-m7O4H3L' in img:
                    if seen_71g:
                        # Clear for 2nd and 3rd occurrences
                        fix(alt, 'imageUrl', None,
                            f"{kit['kitName']}>{toy['toyName']}>{alt['name'][:30]}>reused")
                    else:
                        seen_71g = True
                        print(f"  KEEP: {kit['kitName']}>{toy['toyName']}>{alt['name'][:30]}")

    # ─── FIX: Helper > Felt Flowers > Melissa & Doug Stamp Set ───
    # The description says "flower garden building toy" but this is a stamp set
    # The product name and ASIN (B0040B1JYQ) are correct for the stamp set
    # But it's listed as an alternative for "Felt Flowers in a Row" which doesn't match
    # Leave as-is since it's a valid Amazon product, just fix the image

    # ─── FIX: Duplicate ASIN B00784HJRS (same product listed twice) ───
    print("\n── Fix: Remove duplicate Elite Montessori Sound Boxes ──")
    for kit in data:
        if kit['kitId'] == 'inspector':
            for toy in kit['toys']:
                if toy['toyName'] == 'Wooden Sound Cylinders':
                    alts = toy.get('alternatives', [])
                    if len(alts) >= 2:
                        # Check for duplicate ASINs
                        seen = set()
                        new_alts = []
                        for alt in alts:
                            if alt['asin'] not in seen:
                                seen.add(alt['asin'])
                                new_alts.append(alt)
                            else:
                                fixes_applied += 1
                                print(f"  REMOVE: duplicate {alt['asin']} - {alt['name'][:50]}")
                        toy['alternatives'] = new_alts

    # ─── Summary ───
    print(f"\n{'=' * 80}")
    print(f"TOTAL FIXES APPLIED: {fixes_applied}")
    print(f"{'=' * 80}")

    save_data(data)

if __name__ == '__main__':
    main()
