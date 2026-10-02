#!/usr/bin/env python3
"""Parse the page-split OCR text of Rajavallabha Nighantu (Sapkota ed.) into verses.

Structure per entry (established by inspection):
    [Nepali heading] -> Sanskrit verse: one or more short lines ending in a
                        single danda, then the numbered closing line (॥N॥)
                     -> Nepali translation paragraph (long prose lines)

Verse halves are reattached via a pending buffer: a short line (< MAX_HALF)
ending in danda is verse material if a numbered line follows before any
heading or long prose line intervenes.

Output: raw/nighantu/verses.json - staging list of:
    {page, verse_no, sanskrit, nepali, heading, chapter}
Nothing is interpreted here; this is the RAW layer only.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "raw" / "nighantu" / "pages.json"
OUT = ROOT / "raw" / "nighantu" / "verses.json"

DEV_DIGITS = "०१२३४५६७८९"
DANDA_CLOSE = "\u0965"   # ॥
DANDA_SINGLE = "\u0964"  # ।
MAX_HALF = 62            # max chars for a verse half-line

# Nepali translation prose contains these verb forms; Sanskrit verse does not.
NEPALI_MARKERS = ("हुन्छ", "गर्दछ", "पर्दछ", "भनिन्छ", "लाग्दछ", "आउँदछ",
                  "हुँदैन", "बढाउँदछ", "गर्नू", "गर्नाले")

CHAPTERS = [
    ("घान्यवर्ग", 34, 41),
    ("शाकवर्ग", 42, 58),
    ("फलवर्ग", 59, 75),
    ("मत्स्यवर्ग", 75, 95),
    ("मद्यवर्ग", 96, 97),
    ("मधुवर्ग", 98, 101),
    ("क्षीरवर्ग", 102, 105),
    ("दधिवर्ग", 106, 109),
    ("तक्रवर्ग", 110, 111),
    ("घृतवर्ग", 112, 113),
    ("इक्षुवर्ग", 114, 124),
    ("अन्नवर्ग", 125, 131),
    ("पुष्पवर्ग", 132, 141),
    ("नानौषधिवर्ग", 160, 184),
]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def dev_to_int(s: str) -> int:
    return int("".join(str(DEV_DIGITS.index(c)) for c in s if c in DEV_DIGITS))


def chapter_for(page: int) -> str:
    for name, a, b in CHAPTERS:
        if a <= page <= b:
            return name
    return ""


def clean(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip()


def is_numbered(line: str) -> bool:
    """Closing verse line: contains ॥<digits>॥."""
    return bool(re.search(f"[{DANDA_CLOSE}]\\s*[०-९]+\\s*[{DANDA_CLOSE}]", line))


def is_verse_candidate(line: str) -> bool:
    """Short danda-terminated line: a verse half or a single-line verse.
    Nepali translation prose (contains Nepali verb forms) never qualifies."""
    if any(m in line for m in NEPALI_MARKERS):
        return False
    return len(line) < MAX_HALF and line.endswith((DANDA_SINGLE, DANDA_CLOSE))


def is_colophon_line(line: str) -> bool:
    return "इति" in line and line.endswith(DANDA_CLOSE)


def is_heading(line: str) -> bool:
    return len(line) <= 40 and not line.endswith((DANDA_SINGLE, DANDA_CLOSE))


def parse_page(text: str, page: int) -> list[dict]:
    lines = [clean(l) for l in text.splitlines() if clean(l)]
    out: list[dict] = []
    heading = ""
    pending: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if is_colophon_line(line):
            pending = []  # chapter-end colophon: hard terminator, not a verse
            i += 1
            continue
        if is_numbered(line):
            verse_text = " ".join(pending + [line])
            m = re.search(f"[{DANDA_CLOSE}]\\s*([०-९]+)\\s*[{DANDA_CLOSE}]", verse_text)
            num = dev_to_int(m.group(1)) if m else None
            # Nepali translation: following prose lines (long or non-danda),
            # until a heading or the next verse candidate.
            nep: list[str] = []
            k = i + 1
            while k < n and len(nep) < 3:
                cand = lines[k]
                if is_heading(cand) or is_verse_candidate(cand):
                    break
                nep.append(cand)
                k += 1
            out.append({
                "page": page,
                "verse_no": num,
                "sanskrit": verse_text,
                "nepali": " ".join(nep),
                "heading": heading,
                "chapter": chapter_for(page),
            })
            pending = []
            i = k
            continue
        if is_verse_candidate(line):
            pending.append(line)
        else:
            if is_heading(line):
                heading = line
            pending = []  # prose/translation/colophon clears any pending halves
        i += 1
    return out


def main() -> None:
    pages = json.loads(SRC.read_text(encoding="utf-8"))
    all_v: list[dict] = []
    for n in sorted(pages, key=int):
        page = int(n)
        if page > 184:  # appendices lack verse markers
            continue
        all_v.extend(parse_page(pages[n], page))
    OUT.write_text(json.dumps(all_v, ensure_ascii=False, indent=1), encoding="utf-8")
    with_nep = sum(1 for v in all_v if v["nepali"])
    print(f"verses: {len(all_v)} | with Nepali translation: {with_nep}")


if __name__ == "__main__":
    main()
