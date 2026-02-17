#!/usr/bin/env python3
"""
generate_toy_data.py — Convert scraped JSON data into TypeScript data files
for the Lovevery Kit Guide website.

This script reads JSON files produced by the other scraping scripts and
generates TypeScript source files that can be directly imported by the
React frontend:
  - toyReviews.ts     — Parent review pros/cons per toy
  - toyCleaningGuide.ts — Cleaning instructions per toy
  - toyImages.ts      — Hero and toy image URLs (merge/update mode)

Usage:
    python generate_toy_data.py reviews   -i reviews.json   -o ../client/src/data/
    python generate_toy_data.py cleaning  -i cleaning.json  -o ../client/src/data/
    python generate_toy_data.py images    -i kits.json       -o ../client/src/data/
    python generate_toy_data.py all       --reviews-input r.json --cleaning-input c.json

Requirements:
    No external dependencies (stdlib only).
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def escape_ts_string(s: str) -> str:
    """Escape a string for use inside TypeScript double-quoted strings."""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def load_json(path: str) -> Any:
    """Load and return parsed JSON from a file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_ts(path: Path, content: str) -> None:
    """Write TypeScript content to a file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    log.info("  Written: %s (%d bytes)", path, len(content))


# ---------------------------------------------------------------------------
# Generator: toyReviews.ts
# ---------------------------------------------------------------------------


def generate_reviews_ts(input_path: str, output_dir: str) -> None:
    """Generate toyReviews.ts from a reviews JSON file.

    Expected input format (lovevery_reviews_final.json):
    [
      {
        "kit_id": "charmer",
        "kit_name": "The Charmer",
        "toys": [
          {
            "name": "木制摇铃",
            "english_name": "Wooden Rattle",
            "pros_cn": "...",
            "pros_en": "...",
            "cons_cn": "...",
            "cons_en": "..."
          }
        ]
      }
    ]
    """
    log.info("Generating toyReviews.ts from %s", input_path)
    data = load_json(input_path)

    lines: list[str] = []
    lines.append("/**")
    lines.append(" * Toy Review Data (Pros & Cons)")
    lines.append(f" * Auto-generated from {Path(input_path).name}")
    lines.append(" */")
    lines.append("")
    lines.append("export interface ToyReview {")
    lines.append("  pros: string;")
    lines.append("  cons: string;")
    lines.append("}")
    lines.append("")
    lines.append("// Key format: \"kitId::toyName\"")
    lines.append("const reviewData: Record<string, { pros_cn: string; pros_en: string; cons_cn: string; cons_en: string }> = {")

    entry_count = 0
    for kit in data:
        kit_id = kit.get("kit_id", "")
        for toy in kit.get("toys", []):
            name = toy.get("name", "")
            if not name:
                continue

            pros_cn = escape_ts_string(toy.get("pros_cn", ""))
            pros_en = escape_ts_string(toy.get("pros_en", ""))
            cons_cn = escape_ts_string(toy.get("cons_cn", ""))
            cons_en = escape_ts_string(toy.get("cons_en", ""))

            key = escape_ts_string(f"{kit_id}::{name}")
            lines.append(f'  "{key}": {{')
            lines.append(f'    pros_cn: "{pros_cn}",')
            lines.append(f'    pros_en: "{pros_en}",')
            lines.append(f'    cons_cn: "{cons_cn}",')
            lines.append(f'    cons_en: "{cons_en}",')
            lines.append("  },")
            entry_count += 1

    lines.append("};")
    lines.append("")
    lines.append("/**")
    lines.append(" * Look up review data for a toy.")
    lines.append(" * @param kitId - Kit identifier (e.g. \"charmer\")")
    lines.append(" * @param toyName - Toy name in Chinese")
    lines.append(" * @param lang - Language code (\"cn\" or \"en\")")
    lines.append(" */")
    lines.append('export function getToyReview(kitId: string, toyName: string, lang: "cn" | "en" = "cn"): ToyReview | null {')
    lines.append("  const key = `${kitId}::${toyName}`;")
    lines.append("  const entry = reviewData[key];")
    lines.append("  if (!entry) {")
    lines.append("    // Fuzzy match")
    lines.append("    for (const k of Object.keys(reviewData)) {")
    lines.append('      if (!k.startsWith(kitId + "::")) continue;')
    lines.append('      const name = k.split("::")[1];')
    lines.append("      if (name.includes(toyName) || toyName.includes(name)) {")
    lines.append("        const e = reviewData[k];")
    lines.append('        return { pros: lang === "cn" ? e.pros_cn : e.pros_en, cons: lang === "cn" ? e.cons_cn : e.cons_en };')
    lines.append("      }")
    lines.append("    }")
    lines.append("    return null;")
    lines.append("  }")
    lines.append('  return { pros: lang === "cn" ? entry.pros_cn : entry.pros_en, cons: lang === "cn" ? entry.cons_cn : entry.cons_en };')
    lines.append("}")
    lines.append("")

    output_path = Path(output_dir) / "toyReviews.ts"
    write_ts(output_path, "\n".join(lines))
    log.info("  Generated %d review entries", entry_count)


# ---------------------------------------------------------------------------
# Generator: toyCleaningGuide.ts
# ---------------------------------------------------------------------------


def generate_cleaning_ts(input_path: str, output_dir: str) -> None:
    """Generate toyCleaningGuide.ts from a cleaning guide JSON file.

    Expected input format (lovevery_cleaning_guide.json):
    [
      {
        "kit_id": "adventurer",
        "kit_name": "The Adventurer",
        "toys": [
          {
            "name": "Race & Chase Ramp",
            "name_zh": "滚滚追逐赛道",
            "material": "木质/Wood",
            "cleaning_zh": "用湿布擦拭即可...",
            "cleaning_en": "Wipe clean with a damp cloth..."
          }
        ]
      }
    ]
    """
    log.info("Generating toyCleaningGuide.ts from %s", input_path)
    data = load_json(input_path)

    # Material parsing helper
    def parse_material(mat_str: str) -> tuple[str, str]:
        if "/" in mat_str:
            parts = mat_str.split("/", 1)
            return parts[0].strip(), parts[1].strip()
        return mat_str, mat_str

    # Skip entries with no useful data
    skip_materials = {"未知/Unknown"}
    skip_cleaning = {"无", "无可用清洗建议", "无可用清洁说明", "None"}

    lines: list[str] = []
    lines.append("/**")
    lines.append(" * Toy Cleaning Guide Data")
    lines.append(f" * Auto-generated from {Path(input_path).name}")
    lines.append(" */")
    lines.append("")
    lines.append("export interface CleaningInfo {")
    lines.append("  material: string;")
    lines.append("  materialCn: string;")
    lines.append("  materialEn: string;")
    lines.append("  cleaningCn: string;")
    lines.append("  cleaningEn: string;")
    lines.append("}")
    lines.append("")
    lines.append('// Key format: "kitId::toyNameZh"')
    lines.append("const cleaningData: Record<string, CleaningInfo> = {")

    entry_count = 0
    for kit in data:
        kit_id = kit.get("kit_id", "")
        for toy in kit.get("toys", []):
            material = toy.get("material", "")
            cleaning_zh = toy.get("cleaning_zh", "")
            cleaning_en = toy.get("cleaning_en", "")
            name_zh = toy.get("name_zh", "")

            # Skip useless entries
            if material in skip_materials and cleaning_zh in skip_cleaning:
                continue
            if cleaning_zh in skip_cleaning:
                continue
            if cleaning_en in ("No cleaning instructions available.", "No cleaning instructions available", "None"):
                continue

            mat_cn, mat_en = parse_material(material)
            key = escape_ts_string(f"{kit_id}::{name_zh}")

            lines.append(f'  "{key}": {{')
            lines.append(f'    material: "{escape_ts_string(material)}",')
            lines.append(f'    materialCn: "{escape_ts_string(mat_cn)}",')
            lines.append(f'    materialEn: "{escape_ts_string(mat_en)}",')
            lines.append(f'    cleaningCn: "{escape_ts_string(cleaning_zh)}",')
            lines.append(f'    cleaningEn: "{escape_ts_string(cleaning_en)}",')
            lines.append("  },")
            entry_count += 1

    lines.append("};")
    lines.append("")
    lines.append("/**")
    lines.append(" * Look up cleaning info for a toy by kit ID and toy name (Chinese).")
    lines.append(" */")
    lines.append("export function getCleaningInfo(kitId: string, toyNameZh: string): CleaningInfo | null {")
    lines.append("  const key = `${kitId}::${toyNameZh}`;")
    lines.append("  if (cleaningData[key]) return cleaningData[key];")
    lines.append("")
    lines.append("  // Fuzzy match")
    lines.append("  for (const k of Object.keys(cleaningData)) {")
    lines.append('    if (!k.startsWith(kitId + "::")) continue;')
    lines.append('    const name = k.split("::")[1];')
    lines.append("    if (name.includes(toyNameZh) || toyNameZh.includes(name)) {")
    lines.append("      return cleaningData[k];")
    lines.append("    }")
    lines.append("  }")
    lines.append("  return null;")
    lines.append("}")
    lines.append("")

    output_path = Path(output_dir) / "toyCleaningGuide.ts"
    write_ts(output_path, "\n".join(lines))
    log.info("  Generated %d cleaning entries", entry_count)


# ---------------------------------------------------------------------------
# Generator: toyImages.ts (update mode)
# ---------------------------------------------------------------------------


def generate_images_ts(input_path: str, output_dir: str) -> None:
    """Generate or update toyImages.ts from a kits JSON file.

    This reads the output of scrape_lovevery_official.py and extracts
    hero images and toy images for each kit.

    Expected input format:
    [
      {
        "slug": "looker",
        "og_image": "https://images.ctfassets.net/...",
        "images": ["url1", "url2", ...],
        "toys": [{"name": "...", "image": "..."}]
      }
    ]
    """
    log.info("Generating toyImages.ts from %s", input_path)
    data = load_json(input_path)

    lines: list[str] = []
    lines.append("/**")
    lines.append(" * Toy Image URLs")
    lines.append(f" * Auto-generated from {Path(input_path).name}")
    lines.append(" */")
    lines.append("")
    lines.append("interface KitImages {")
    lines.append("  heroImage: string;")
    lines.append("  toyImages: string[];")
    lines.append("}")
    lines.append("")
    lines.append("const kitImageData: Record<string, KitImages> = {")

    for kit in data:
        slug = kit.get("slug", "")
        hero = kit.get("og_image", "")
        images = kit.get("images", [])
        toy_images = [t.get("image", "") for t in kit.get("toys", []) if t.get("image")]

        # Use first Contentful image as hero if og_image is empty
        if not hero and images:
            hero = images[0]

        lines.append(f'  "{escape_ts_string(slug)}": {{')
        lines.append(f'    heroImage: "{escape_ts_string(hero)}",')
        lines.append(f"    toyImages: [")
        for img in (toy_images or images[:10]):
            lines.append(f'      "{escape_ts_string(img)}",')
        lines.append("    ],")
        lines.append("  },")

    lines.append("};")
    lines.append("")
    lines.append("export function getKitHeroImage(kitId: string): string {")
    lines.append('  return kitImageData[kitId]?.heroImage || "";')
    lines.append("}")
    lines.append("")
    lines.append("export function getToyImage(kitId: string, index: number): string {")
    lines.append("  const images = kitImageData[kitId]?.toyImages || [];")
    lines.append('  return images[index] || "";')
    lines.append("}")
    lines.append("")
    lines.append("export function getKitToyImages(kitId: string): string[] {")
    lines.append("  return kitImageData[kitId]?.toyImages || [];")
    lines.append("}")
    lines.append("")

    output_path = Path(output_dir) / "toyImages.ts"
    write_ts(output_path, "\n".join(lines))
    log.info("  Generated image data for %d kits", len(data))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert scraped JSON data into TypeScript data files.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate toyReviews.ts
  %(prog)s reviews -i data/lovevery_reviews_final.json -o ../client/src/data/

  # Generate toyCleaningGuide.ts
  %(prog)s cleaning -i data/lovevery_cleaning_guide.json -o ../client/src/data/

  # Generate toyImages.ts
  %(prog)s images -i data/lovevery_kits.json -o ../client/src/data/

  # Generate all TypeScript files at once
  %(prog)s all \\
    --reviews-input data/reviews.json \\
    --cleaning-input data/cleaning.json \\
    --images-input data/kits.json \\
    -o ../client/src/data/
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Data type to generate")

    # Reviews subcommand
    reviews_parser = subparsers.add_parser("reviews", help="Generate toyReviews.ts")
    reviews_parser.add_argument(
        "-i", "--input", required=True, help="Input reviews JSON file"
    )
    reviews_parser.add_argument(
        "-o", "--output-dir", required=True, help="Output directory for .ts file"
    )

    # Cleaning subcommand
    cleaning_parser = subparsers.add_parser("cleaning", help="Generate toyCleaningGuide.ts")
    cleaning_parser.add_argument(
        "-i", "--input", required=True, help="Input cleaning guide JSON file"
    )
    cleaning_parser.add_argument(
        "-o", "--output-dir", required=True, help="Output directory for .ts file"
    )

    # Images subcommand
    images_parser = subparsers.add_parser("images", help="Generate toyImages.ts")
    images_parser.add_argument(
        "-i", "--input", required=True, help="Input kits JSON file"
    )
    images_parser.add_argument(
        "-o", "--output-dir", required=True, help="Output directory for .ts file"
    )

    # All subcommand
    all_parser = subparsers.add_parser("all", help="Generate all TypeScript files")
    all_parser.add_argument(
        "--reviews-input", help="Input reviews JSON file"
    )
    all_parser.add_argument(
        "--cleaning-input", help="Input cleaning guide JSON file"
    )
    all_parser.add_argument(
        "--images-input", help="Input kits JSON file"
    )
    all_parser.add_argument(
        "-o", "--output-dir", required=True, help="Output directory for .ts files"
    )

    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable debug logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "reviews":
        generate_reviews_ts(args.input, args.output_dir)

    elif args.command == "cleaning":
        generate_cleaning_ts(args.input, args.output_dir)

    elif args.command == "images":
        generate_images_ts(args.input, args.output_dir)

    elif args.command == "all":
        if args.reviews_input:
            generate_reviews_ts(args.reviews_input, args.output_dir)
        if args.cleaning_input:
            generate_cleaning_ts(args.cleaning_input, args.output_dir)
        if args.images_input:
            generate_images_ts(args.images_input, args.output_dir)

        if not any([args.reviews_input, args.cleaning_input, args.images_input]):
            log.error("No input files specified. Use --reviews-input, --cleaning-input, or --images-input.")
            sys.exit(1)

    log.info("All done!")


if __name__ == "__main__":
    main()
