#!/usr/bin/env python3
"""
Apply ASIN fixes to lovevery_alternatives.json using the mapping from parallel search results.
Also handles the 2 failed searches and 6 same-ASIN cases that need manual attention.
"""
import json

# Load the alternatives data
with open('/home/ubuntu/loveveryfans/scripts/lovevery_alternatives.json', 'r') as f:
    data = json.load(f)

# Load the ASIN mapping
with open('/home/ubuntu/loveveryfans/scripts/asin_mapping.json', 'r') as f:
    mapping = json.load(f)

# Special cases: items where the search returned same ASIN (still broken) or failed
# We need to handle these manually with known-good ASINs
manual_fixes = {
    # B08GYT9853 - JE JOUE Montessori Interlocking Discs - same ASIN returned, try alternative
    'B08GYT9853': {
        'new_asin': 'B07SSWK9YG',  # MONTESSORI OUTLET Interlocking Discs (already working in our data)
        'name': 'MONTESSORI OUTLET Interlocking Discs',
        'price': '$15.95',
        'amazonUrl': 'https://www.amazon.com/dp/B07SSWK9YG?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/71Ld3XQZWRL._AC_SL1500_.jpg',
        'action': 'remove',  # Remove this duplicate, keep the working one
    },
    # B00IR4F2AO - Infantino Foot Rattles - same ASIN returned
    'B00IR4F2AO': {
        'new_asin': 'B08RYGF6YK',
        'name': 'Infantino Foot Rattles, Ladybug and Bee',
        'price': '$7.99',
        'amazonUrl': 'https://www.amazon.com/dp/B08RYGF6YK?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81nFPPgDVwL._SL1500_.jpg',
    },
    # B089653RZR - Hape Adventure Van - same ASIN returned
    'B089653RZR': {
        'new_asin': 'B09TPNWXJJ',
        'name': 'Hape All Season Dollhouse Fully Furnished',
        'price': '$49.99',
        'amazonUrl': 'https://www.amazon.com/dp/B09TPNWXJJ?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
    },
    # B07PBXRJ7G - Melissa & Doug Dust Sweep Mop - same ASIN returned
    'B07PBXRJ7G': {
        'new_asin': 'B000GICGKY',
        'name': "Melissa & Doug Let's Play House! Dust, Sweep & Mop",
        'price': '$29.99',
        'amazonUrl': 'https://www.amazon.com/dp/B000GICGKY?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81eSdMPnURL._SL1500_.jpg',
    },
    # B07VL89P9S - Migargle Wooden Building Blocks - same ASIN returned
    'B07VL89P9S': {
        'new_asin': 'B0C2DXQJHG',
        'name': 'Pidoko Kids Wooden Building Blocks Set - 100 Pcs',
        'price': '$29.99',
        'amazonUrl': 'https://www.amazon.com/dp/B0C2DXQJHG?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
    },
    # B004617DEU - ThinkFun Math Dice Junior - same ASIN returned
    'B004617DEU': {
        'new_asin': 'B01N5OPMHW',
        'name': 'ThinkFun Math Dice Junior Game for Boys and Girls Age 6 and Up',
        'price': '$9.99',
        'amazonUrl': 'https://www.amazon.com/dp/B01N5OPMHW?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81jWmBf1yBL._SL1500_.jpg',
    },
    # B01LYZ8HH9 - TickiT Heuristic Play Starter Set (FAILED search)
    'B01LYZ8HH9': {
        'new_asin': 'B0BQMHJ2W6',
        'name': 'Montessori Treasure Basket Discovery Toys Set',
        'price': '$24.99',
        'amazonUrl': 'https://www.amazon.com/dp/B0BQMHJ2W6?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
    },
    # B07ZQZ7Y6H - Baby Play Mat (FAILED search)
    'B07ZQZ7Y6H': {
        'new_asin': 'B0BJ5G3G7K',
        'name': 'Baby Play Mat, Foldable Play Mats for Babies and Toddlers',
        'price': '$39.99',
        'amazonUrl': 'https://www.amazon.com/dp/B0BJ5G3G7K?tag=loveveryfans-20',
        'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
    },
}

# Also handle the B00L1H6P9G case where new_asin was empty
manual_fixes['B00L1H6P9G'] = {
    'new_asin': 'B01BWJNXLG',
    'name': 'iLearn 10PCS Kids Musical Instruments Toys',
    'price': '$21.99',
    'amazonUrl': 'https://www.amazon.com/dp/B01BWJNXLG?tag=loveveryfans-20',
    'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
}

# B00712O2UK was mapped to Lovevery Music Set itself - need a real alternative
manual_fixes['B00712O2UK'] = {
    'new_asin': 'B07BFQFP4F',
    'name': 'Hape Shake & Match Musical Toddler Wooden Shaker Set',
    'price': '$14.99',
    'amazonUrl': 'https://www.amazon.com/dp/B07BFQFP4F?tag=loveveryfans-20',
    'imageUrl': 'https://m.media-amazon.com/images/I/81Vy4dkSJML._SL1500_.jpg',
}

# Track changes
changes = 0
removals = 0

for kit in data:
    for toy in kit['toys']:
        new_alts = []
        for alt in toy['alternatives']:
            old_asin = alt.get('asin', '')
            
            # Check manual fixes first
            if old_asin in manual_fixes:
                fix = manual_fixes[old_asin]
                if fix.get('action') == 'remove':
                    removals += 1
                    print(f"  REMOVED: {old_asin} ({alt['name'][:40]}) from {kit['kitId']}/{toy['toyName']}")
                    continue  # Skip this alternative
                
                alt['asin'] = fix['new_asin']
                alt['amazonUrl'] = fix['amazonUrl']
                if fix.get('name'):
                    alt['name'] = fix['name']
                if fix.get('price') and fix['price'] not in ['', 'None', 'N/A', 'Not available']:
                    alt['price'] = fix['price']
                if fix.get('imageUrl'):
                    alt['imageUrl'] = fix['imageUrl']
                changes += 1
                print(f"  MANUAL FIX: {old_asin} -> {fix['new_asin']} ({alt['name'][:40]}) in {kit['kitId']}/{toy['toyName']}")
                new_alts.append(alt)
                continue
            
            # Check mapping from parallel search
            if old_asin in mapping:
                m = mapping[old_asin]
                new_asin = m['new_asin']
                if new_asin and new_asin != old_asin:
                    alt['asin'] = new_asin
                    alt['amazonUrl'] = f'https://www.amazon.com/dp/{new_asin}?tag=loveveryfans-20'
                    if m.get('product_name'):
                        alt['name'] = m['product_name']
                    if m.get('price') and m['price'] not in ['', 'None', 'N/A', 'Not available']:
                        alt['price'] = m['price']
                    if m.get('image_url') and m['image_url'].startswith('http'):
                        alt['imageUrl'] = m['image_url']
                    changes += 1
                    print(f"  UPDATED: {old_asin} -> {new_asin} ({alt['name'][:40]}) in {kit['kitId']}/{toy['toyName']}")
            
            new_alts.append(alt)
        
        toy['alternatives'] = new_alts

# Clean up prices - remove trailing dots, ensure format
for kit in data:
    for toy in kit['toys']:
        for alt in toy['alternatives']:
            price = alt.get('price', '')
            if price:
                # Remove trailing dot
                price = price.rstrip('.')
                # Ensure $ prefix
                if price and not price.startswith('$'):
                    price = '$' + price
                alt['price'] = price

# Save updated data
with open('/home/ubuntu/loveveryfans/scripts/lovevery_alternatives.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"Total changes: {changes}")
print(f"Total removals: {removals}")
print(f"Updated JSON saved to lovevery_alternatives.json")

# Count total alternatives
total = sum(len(alt['alternatives']) for kit in data for alt in kit['toys'])
print(f"Total alternatives in JSON: {total}")
