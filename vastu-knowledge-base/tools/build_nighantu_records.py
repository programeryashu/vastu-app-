#!/usr/bin/env python3
"""Build 11_rajavallabha_nighantu.json records from raw/nighantu/verses.json.

RAW -> NORMALIZED -> SOURCE CLAIM (stays below the VASTU CROSS-LINK layer
except where the source itself is explicit about directions).

ID scheme (deterministic, meaning-encoding; the edition's own verse numbers
restart in each parichchheda, so the printed page disambiguates):
    nighantu_<section>_p<page>_v<verse>   e.g. nighantu_paurvahlika_p010_v027

vastu_relevance: 'explicit' ONLY for entries the source itself ties to
directions (directional winds v27-v37 of the forenoon parichchheda; the
facing rule for tooth-cleaning v13 of the morning parichchheda); 'potential'
when dwelling/furniture terms appear; otherwise 'none'.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "raw" / "nighantu" / "verses.json"
SECTION = ROOT / "11_rajavallabha_nighantu.json"

EDITION_ID = "source_rajavallabha_nighantu_edition_nepali_2024"

# (section_code, first_page, last_page, entry_type) — first match wins.
# Boundaries verified against the edition's own varga/parichchheda markers.
SECTIONS = [
    ("prabhatika", 1, 5, "usage"),        # morning routine
    ("paurvahlika", 6, 33, "usage"),      # forenoon duties: winds, oils, brushing...
    ("ghanya", 34, 41, "material"),       # grains
    ("shaka", 42, 58, "plant"),           # vegetables (incl. fruit-vegetables)
    ("phala", 59, 75, "plant"),           # fruits
    ("matsya", 75, 95, "substance"),      # fish
    ("madya", 96, 97, "substance"),       # wines
    ("madhu", 98, 101, "substance"),      # honey
    ("kshira", 102, 105, "substance"),    # milk
    ("dadhi", 106, 109, "substance"),     # curd
    ("takra", 110, 111, "substance"),     # buttermilk
    ("ghrita", 112, 113, "substance"),    # ghee
    ("ikshu", 114, 124, "substance"),     # sugarcane + products
    ("anna", 125, 131, "substance"),      # cooked foods
    ("pushpa", 132, 141, "plant"),        # flowers
    ("chikitsa", 141, 159, "usage"),      # viruddhahara diseases + treatment
    ("aushadhi", 160, 184, "herb"),       # medicines
]

CHAPTER_NAMES = {
    "prabhatika": "प्राभातिकपरिच्छेद", "paurvahlika": "पौर्वाह्विकपरिच्छेद",
    "ghanya": "घान्यवर्ग", "shaka": "शाकवर्ग", "phala": "फलवर्ग",
    "matsya": "मत्स्यवर्ग", "madya": "मद्यवर्ग", "madhu": "मधुवर्ग",
    "kshira": "क्षीरवर्ग", "dadhi": "दधिवर्ग", "takra": "तक्रवर्ग",
    "ghrita": "घृतवर्ग", "ikshu": "इक्षुवर्ग", "anna": "अन्नवर्ग",
    "pushpa": "पुष्पवर्ग", "chikitsa": "विरुद्धाहारजनितरोग चिकित्सा",
    "aushadhi": "नानौषधिवर्ग",
}

# (section, verse, directions, marker-word actually present in the OCR verse line)
EXPLICIT = [
    ("paurvahlika", 27, ["direction_E"], "प्राग्वातो"),
    ("paurvahlika", 28, ["direction_E"], "सन्निपातज्वर"),  # verse split across p10-11
    ("paurvahlika", 29, ["direction_E"], "कोपयेदामवातञ्च"),
    ("paurvahlika", 30, ["direction_S"], "दक्षिणो"),
    ("paurvahlika", 31, ["direction_S"], "रक्तपित्तप्रशमनो"),
    ("paurvahlika", 32, ["direction_W"], "पश्चिमो"),
    ("paurvahlika", 33, ["direction_W"], "अपां"),
    ("paurvahlika", 34, ["direction_W"], "व्रणसंरोपणस्त्वच्यो"),
    ("paurvahlika", 35, ["direction_N"], "औत्तरो"),
    ("paurvahlika", 36, ["direction_N"], "क्षीणक्षतविषार्तानां"),
    ("prabhatika", 13, ["direction_E", "direction_S", "direction_W", "direction_N"],
     "स्याद्यक्षिणास्येन"),
]

# dwelling/furniture terms that make an entry potentially Vastu-relevant
POTENTIAL_TOKENS = ("गृह", "घर", "भवन", "निवेश", "वास्तु", "आवास", "द्वार",
                    "आसन", "शय्या", "पलङ")


def zone(page: int):
    for code, a, b, et in SECTIONS:
        if a <= page <= b:
            return code, et
    return "", "unknown"


def classify(v: dict):
    code, et = zone(v["page"])
    vn = v["verse_no"]
    for sec, verse, dirs, marker in EXPLICIT:
        if sec == code and vn == verse and marker in v["sanskrit"]:
            return "vastu_relevant", dirs, "explicit"
    hay = v["sanskrit"] + " " + v["nepali"] + " " + v["heading"]
    if any(t in hay for t in POTENTIAL_TOKENS):
        return et, [], "potential"
    return et, [], "none"


def is_colophon(v: dict) -> bool:
    s = v["sanskrit"].strip()
    return v["verse_no"] is None and (
        s.startswith("॥ इति") or s.startswith("इति") or "समाप्त" in v["nepali"][:40]
    )


def build_record(v: dict) -> dict | None:
    if is_colophon(v) or v["verse_no"] is None:
        return None
    code, et = zone(v["page"])
    if not code:
        return None  # unzoned page (appendix) — later batch
    entry_type, dirs, relevance = classify(v)
    rid = f"nighantu_{code}_p{v['page']:03d}_v{v['verse_no']:03d}"
    heading = v["heading"].strip()
    base = re.sub(r"^(अथ\s+)", "", heading)
    base = re.sub(r"[（(].*?[)）]", "", base).strip(" :：-")
    base = re.sub(r"(गुणा:?|गुणमाह:?|गुण:?|फलगुणा:?)$", "", base).strip()
    return {
        "id": rid,
        "source_id": EDITION_ID,
        "entry_type": entry_type,
        "name": {"primary": base, "sanskrit": base} if base else {},
        "description": "",
        "traditional_properties": [],
        "uses": [],
        "effects": [],
        "associated_objects": [],
        "associated_directions": dirs,
        "associated_spaces": [],
        "vastu_relevance": relevance,
        "claim_type": "direct_source_claim",
        "source_reference": {
            "page": v["page"],
            "chapter": CHAPTER_NAMES.get(code, v["chapter"]),
            "verse": v["verse_no"],
            "entry": heading,
        },
        "source_reference_status": "located",
        "original_text": v["sanskrit"],
        "transliteration": "",
        "translated_text": v["nepali"],
        "normalized_interpretation": "",
        "notes": "OCR text layer of the Sapkota edition (VS 2080); pending visual proofread against page images.",
        "evidence_level": "A",
        "verification_status": "partially_verified",
    }


def main() -> None:
    verses = json.loads(SRC.read_text(encoding="utf-8"))
    records: dict[str, dict] = {}
    dupes = colophons = structural = 0
    for v in verses:
        if is_colophon(v):
            colophons += 1
            continue
        if v["verse_no"] is None:
            structural += 1
            continue
        if v["verse_no"] is None or v["verse_no"] == 0:
            structural += 1  # 000 = OCR-mangled verse number
            continue
        rec = build_record(v)
        if rec is None:
            structural += 1
            continue
        if rec["id"] in records:
            dupes += 1
            continue
        records[rec["id"]] = rec

    ordered = list(records.values())
    section = json.loads(SECTION.read_text(encoding="utf-8"))
    section["records"] = ordered
    section["integration_status"] = {
        "state": "batch_1_extracted",
        "note": (
            "Records extracted from the OCR text layer of the Sapkota edition "
            "(Nepali bhavanuvada of the Sanskrit root text, VS 2080 / 2024, "
            "archive.org item 'rajvallabha-nigantu'), verse-marked pages 1-184. "
            "The edition numbers verses continuously within each parichchheda, so "
            "IDs carry the printed page as well. Every record cites page + verse + "
            "chapter as parsed from the running headers. Pending: visual proofread "
            "against page images; transliteration and normalized_interpretation "
            "layers; appendix pages 185+ (no verse markers) are a later batch."
        ),
        "requested_from_user": "",
        "records_present": len(ordered),
        "records_extracted_total_estimate": len(ordered),
    }
    SECTION.write_text(
        json.dumps(section, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    from collections import Counter
    rel = Counter(r["vastu_relevance"] for r in ordered)
    et = Counter(r["entry_type"] for r in ordered)
    print(f"records: {len(ordered)} | duplicate IDs skipped: {dupes} "
          f"| colophons skipped: {colophons} | structural skipped: {structural}")
    print(f"vastu_relevance: {dict(rel)}")
    print(f"entry_type: {dict(et)}")


if __name__ == "__main__":
    main()
