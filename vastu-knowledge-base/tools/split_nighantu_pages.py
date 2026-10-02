#!/usr/bin/env python3
"""Split the OCR text of the Sapkota edition of Rajavallabha Nighantu into pages.

Input:  raw/nighantu/ocr_full.txt  (archive.org *_djvu.txt of 'rajvallabha-nigantu')
Output: raw/nighantu/pages.json    ({page_number: text} keyed by printed page)

The OCR text interleaves the Sanskrit root text and the editor's Nepali
translation; running headers carry the printed page number ("पेज नं.N").
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "raw" / "nighantu" / "ocr_full.txt"
OUT = ROOT / "raw" / "nighantu" / "pages.json"

DEV_DIGITS = "०१२३४५६७८९"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def dev_to_int(s: str) -> int:
    return int("".join(str(DEV_DIGITS.index(c)) for c in s if c in DEV_DIGITS))


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    pat = re.compile(r"श्रीराजवल्लभ निघण्टु[^\n]*पेज नं\.?\s*([०-९]+)")
    parts = pat.split(text)

    pages: dict[int, str] = {}
    front = parts[0]
    for i in range(1, len(parts) - 1, 2):
        num = dev_to_int(parts[i])
        pages[num] = parts[i + 1]

    OUT.write_text(
        json.dumps({str(k): v for k, v in sorted(pages.items())}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"pages parsed: {len(pages)} | range: {min(pages)}–{max(pages)}"
          f" | front matter chars: {len(front)}")


if __name__ == "__main__":
    main()
