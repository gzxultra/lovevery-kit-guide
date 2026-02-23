#!/usr/bin/env python3
"""
Image fixer for lovevery_alternatives.json.

Run this AFTER opening each Amazon product page in your browser.
For each ASIN, visit the Amazon page, right-click the main product image,
copy the image URL, and paste it when prompted.

Usage: python3 scripts/fix_images_interactive.py
"""

import json
import sys

ASINS_NEEDING_IMAGES = [
    ("B0040B1JYQ", "Melissa & Doug Deluxe Wooden Stamp Set: Animals"),
    ("B0D77BQNVM", "Quiggly Toy Spray Mop"),
    ("B078J5JP34", "Play22 Kids Cleaning Set 4 Piece"),
    ("B0CR1TK5VX", "Lasoba Animal Alphabet Puzzle"),
    ("B091GXM2Y6", "KRAFUN My First Sewing Kit"),
    ("B099DRS8W7", "Reward Chore Chart for Kids"),
    ("B01N1UUHP4", "Tiny Polka Dot"),
    ("B00I00NIDS", "Learning Resources I Sea 10! Game"),
    ("B079GFQ56B", "Schylling Pan Flute"),
    ("B00R0V7PUU", "Boon Pipes Toddler Bath Toys"),
    ("B001QCIG16", "Yookidoo Stack N Spray Bath Toy"),
    ("B004P5PD9O", "KEVA Structures 200 Plank Set"),
    ("B0D53V7BNX", "Complex Black and White Card Set"),
    ("B00712O2D6", "Hape Pound & Tap Bench"),
    ("B092DSWW6N", "Kids Accordion"),
    ("B000EENAGS", "Hohner Kids Handle Sleigh Bells"),
    ("B07YNKJ2HQ", "Wood Egg Shakers Set"),
    ("B0CB1PRJZ4", "Wooden Floral Fruit-Sensing Metronome"),
    ("B0DQPXVRQ8", "iPlay iLearn Baby Bath Toys"),
    ("B00DJPK8PA", "Infantino Textured Multi Ball Set"),
    ("B019ICFYNI", "VTech Baby Rattle and Sing Puppy"),
    ("B00913DY3W", "Comotomo Silicone Baby Teether, Orange"),
    ("B0BQMHJ2W6", "Montessori Treasure Basket Discovery Toys Set"),
    ("B0C2DXQJHG", "Pidoko Kids Wooden Building Blocks Set"),
    ("B092ZZNRVN", "Tender Leaf Toys Bear Tales"),
    ("B00712O2A2", "Hape Doll Family Grandparents"),
    ("B000IMQ40U", "Melissa & Doug Multi-Activity Play Table"),
    ("B0BHX8KW3X", "Nuby Reversible Baby Floor Mat"),
]

def main():
    with open('scripts/lovevery_alternatives.json', 'r') as f:
        data = json.load(f)

    print("=" * 60)
    print("AMAZON IMAGE FIXER")
    print("=" * 60)
    print(f"\n{len(ASINS_NEEDING_IMAGES)} items need images.")
    print("For each item, open the Amazon link in your browser,")
    print("right-click the product image, and copy the image URL.")
    print("Paste it here, or press Enter to skip.\n")

    fixes = 0
    for asin, name in ASINS_NEEDING_IMAGES:
        print(f"\n─── {name} ───")
        print(f"  Amazon: https://www.amazon.com/dp/{asin}")
        url = input(f"  Image URL (or Enter to skip): ").strip()

        if url and 'media-amazon.com' in url:
            # Clean the URL - extract base image ID
            import re
            match = re.search(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9_+%-]+)', url)
            if match:
                clean_url = match.group(1) + '.jpg'
            else:
                clean_url = url

            # Find and update in data
            for kit in data:
                for toy in kit['toys']:
                    for alt in toy.get('alternatives', []):
                        if alt['asin'] == asin:
                            alt['imageUrl'] = clean_url
                            fixes += 1
                            print(f"  ✓ Updated: {clean_url}")
        elif url:
            print(f"  ✗ Skipped (not an Amazon image URL)")
        else:
            print(f"  - Skipped")

    if fixes > 0:
        with open('scripts/lovevery_alternatives.json', 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n{'=' * 60}")
        print(f"Done! {fixes} images updated.")
        print(f"{'=' * 60}")
    else:
        print("\nNo changes made.")

if __name__ == '__main__':
    main()
