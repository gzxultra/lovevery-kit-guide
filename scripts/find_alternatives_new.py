#!/usr/bin/env python3
"""
Find Amazon alternatives for Lovevery standalone products (Music Set, Bath Set, Block Set, Play Gym)
using OpenAI API to generate recommendations.
"""
import json
import os
import time
from openai import OpenAI

client = OpenAI()

AFFILIATE_TAG = "loveveryfans-20"

# Product data for each standalone product
PRODUCTS = {
    "musicSet": {
        "kitName": "The Music Set",
        "toys": [
            {"toyName": "Pentatonic Pat Bells", "toyNameCn": "五音拍打铃", "desc": "Tap each bell to hear notes C, D, E, G, and A. Bells can be removed from the color-coded wooden base for individual play."},
            {"toyName": "Color Tab Pan Flute", "toyNameCn": "彩色排笛", "desc": "Learn to blow and practice breath control with color-coded ribbons that show your child which note is being played."},
            {"toyName": "Simple Concertina", "toyNameCn": "简易手风琴", "desc": "Work on bilateral coordination by pulling and pressing this concertina that plays two C-major chords."},
            {"toyName": "Jingle Bracelet With Wooden Handle", "toyNameCn": "木柄铃铛手环", "desc": "Shake this percussion instrument on the wooden handle or slip it off to wear around the wrists and ankles."},
            {"toyName": "Loud & Quiet Stackable Shakers", "toyNameCn": "可叠放沙锤", "desc": "Stack, roll, tap, and shake this set of quiet and loud percussion instruments."},
            {"toyName": "Animal Metronome", "toyNameCn": "动物节拍器", "desc": "Explore the basics of tempo with 8 animals that represent different speeds, and a green LED light that blinks."},
        ]
    },
    "bathSet": {
        "kitName": "The Bath Set",
        "toys": [
            {"toyName": "In Then Out Bath Tube", "toyNameCn": "进出浴管", "desc": "Explore containment with a tube that lets the ball slide through if it's open, but not if it's closed."},
            {"toyName": "Scoop & Spin Bath Cup", "toyNameCn": "舀水旋转杯", "desc": "Encourage your child's natural curiosity with a cup that does double-duty as a water wheel."},
            {"toyName": "Fast & Slow Water Wheel", "toyNameCn": "快慢水车", "desc": "Stick this drum to the side of your tub and make it spin, and put a toy inside to see how it moves."},
            {"toyName": "I See You Bath Mirror", "toyNameCn": "浴室镜子", "desc": "Peek at a squeaky clean face or balance objects as you tip and turn this mirror."},
            {"toyName": "Big & Little Ducks", "toyNameCn": "大小鸭子", "desc": "Quack, swim, and splash with this sweet set of new friends."},
            {"toyName": "Shake & Splash Bath Ball", "toyNameCn": "摇晃溅水球", "desc": "Rattle this ball and follow it back to the surface when you try to sink it."},
            {"toyName": "Peek-A-Boo Boat", "toyNameCn": "躲猫猫小船", "desc": "Float, fill, sink, and start again with this boat that hides a surprise."},
        ]
    },
    "blockSet": {
        "kitName": "The Block Set",
        "toys": [
            {"toyName": "Solid Wood Building Blocks", "toyNameCn": "实木积木块", "desc": "15 colorful cubes for counting, stacking, and toppling. Mix and match with other shapes."},
            {"toyName": "Building Planks", "toyNameCn": "积木板", "desc": "18 wooden planks in 18 colors for fun practice with balance, stability, and geometry."},
            {"toyName": "Assorted Shapes", "toyNameCn": "各种形状积木", "desc": "9 geometrically shaped blocks and 2 arches for imaginative play, shape sorting, and more complex building."},
            {"toyName": "Play People", "toyNameCn": "木制人偶", "desc": "4 wooden friends to help bring a whole new world of imagination to life."},
            {"toyName": "Threading Blocks", "toyNameCn": "穿线积木", "desc": "6 blocks designed for fun fine motor coordination and dexterity practice with a toggle string."},
            {"toyName": "Storage Box with Ramp", "toyNameCn": "收纳盒带斜坡", "desc": "A box with a shape-sorting lid and a divider that doubles as a ramp for physics concepts."},
        ]
    },
    "playGym": {
        "kitName": "The Play Gym",
        "toys": [
            {"toyName": "High-Contrast Ball", "toyNameCn": "高对比度球", "desc": "Grasp, pass, and roll this Montessori classic that's perfect for little hands and detachable for easy play."},
            {"toyName": "Batting Ring", "toyNameCn": "拍打环", "desc": "Reach and bat with an ergonomic design that encourages movement, featuring bell and castanet sounds."},
            {"toyName": "Organic Cotton Teether", "toyNameCn": "有机棉牙胶", "desc": "Grasp and mouth this detachable teether made from organic cotton."},
            {"toyName": "Teething Ring", "toyNameCn": "硅胶牙胶环", "desc": "Chew comfortably with a silicone ring manufactured without PVC for safe teething."},
            {"toyName": "Black & White Card Set", "toyNameCn": "黑白卡片套装", "desc": "Focus on high-contrast images that gradually get more complex over the first 12 weeks."},
            {"toyName": "Play Space Cover", "toyNameCn": "游戏空间盖", "desc": "Double-sided cover that transforms from a high-contrast pattern for babies to a play fort for toddlers."},
        ]
    }
}

def find_alternative(toy_name, toy_desc, kit_name):
    """Use OpenAI to find an Amazon alternative for a specific toy."""
    prompt = f"""Find ONE specific Amazon product that is a good affordable alternative to the Lovevery "{toy_name}" from "{kit_name}".

The Lovevery toy description: {toy_desc}

Requirements:
1. Must be a REAL product available on Amazon.com
2. Must serve a similar developmental/play purpose
3. Should be affordable (cheaper than Lovevery)
4. Must be safe for babies/toddlers
5. Should have good reviews (4+ stars)

Return a JSON object with these exact fields:
{{
  "name": "Full product name on Amazon",
  "asin": "Amazon ASIN (10 character alphanumeric code like B0XXXXXXXX)",
  "price": "Estimated price like $15.99",
  "rating": 4.5,
  "reviewCount": 1000,
  "reasonEn": "Brief reason why this is a good alternative (1-2 sentences)",
  "reasonCn": "Chinese translation of the reason (1-2 sentences)"
}}

IMPORTANT: Return ONLY the JSON object, no other text. The ASIN must be a real Amazon ASIN."""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
        )
        content = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content.rsplit("```", 1)[0]
        return json.loads(content)
    except Exception as e:
        print(f"  Error finding alternative for {toy_name}: {e}")
        return None


def main():
    # Load existing alternatives
    with open("scripts/lovevery_alternatives.json") as f:
        existing = json.load(f)

    new_entries = []

    for product_id, product in PRODUCTS.items():
        print(f"\n{'='*60}")
        print(f"Processing: {product['kitName']} ({product_id})")
        print(f"{'='*60}")

        entry = {
            "kitId": product_id,
            "kitName": product["kitName"],
            "toys": []
        }

        for toy in product["toys"]:
            print(f"  Finding alternative for: {toy['toyName']}...")
            alt = find_alternative(toy["toyName"], toy["desc"], product["kitName"])

            toy_entry = {
                "toyName": toy["toyName"],
                "toyNameCn": toy["toyNameCn"],
                "alternatives": []
            }

            if alt:
                alt["amazonUrl"] = f"https://www.amazon.com/dp/{alt['asin']}?tag={AFFILIATE_TAG}"
                alt["imageUrl"] = f"https://m.media-amazon.com/images/I/{alt['asin']}._AC_SL1500_.jpg"
                toy_entry["alternatives"].append(alt)
                print(f"    ✓ Found: {alt['name']} ({alt['asin']}) - {alt.get('price', 'N/A')}")
            else:
                print(f"    ✗ No alternative found")

            entry["toys"].append(toy_entry)
            time.sleep(0.5)  # Rate limiting

        new_entries.append(entry)

    # Merge with existing data
    all_data = existing + new_entries

    # Save
    with open("scripts/lovevery_alternatives.json", "w") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"Done! Total products: {len(all_data)}")
    print(f"New products added: {len(new_entries)}")
    print(f"Saved to scripts/lovevery_alternatives.json")


if __name__ == "__main__":
    main()
