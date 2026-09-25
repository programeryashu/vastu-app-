#!/usr/bin/env python3
"""Regenerate the Vastu Compass app dataset from the pipeline database.

Single source of truth: the pipeline staging DB (vastu_pipeline.sqlite3) holds
every fact — the curated Vastu Chintamani entries (with their original app
fields preserved in the source_app_* columns) plus every other staged source.
This script rebuilds ../src/data/vastuEntries.json from ALL of them, so the
app and the exported dataset can never drift.

Vastu Chintamani facts are round-tripped losslessly via their source_app_*
fields; facts from other sources get a derived app-entry shape (category
mapped to the app's category labels, issue_topic taken from the claim).

Usage:
  python scripts/build_app_dataset.py            # write only if content changed
  python scripts/build_app_dataset.py --check    # exit 1 if the file is stale
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from vdp import db  # noqa: E402

CHINTAMANI = "VASTU-CHINTAMANI-001"
OUT = ROOT.parent / "src" / "data" / "vastuEntries.json"

CODE_TO_APP_DIRECTION = {
    "N": "North", "NE": "North-East", "E": "East", "SE": "South-East",
    "S": "South", "SW": "South-West", "W": "West", "NW": "North-West",
    "center": "Centre",
}

SPACE_CATEGORIES = {
    "room", "entrance", "kitchen", "bedroom", "bathroom", "puja_room",
    "staircase", "window", "door", "plot", "land",
}
NAMED_CATEGORIES = {
    "principles": "Vastu Principles",
    "defects": "Vastu Defects / Problems",
    "mantras": "Mantras / Prayers / Rituals",
    "remedies": "Remedies / Corrective Actions",
    "direction": "Directions and Their Significance",
}


def app_category(cat: str) -> str:
    if cat in NAMED_CATEGORIES:
        return NAMED_CATEGORIES[cat]
    if cat in SPACE_CATEGORIES:
        return "Room Placement Recommendations"
    return "Vastu Principles"


def confidence_label(value) -> str:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return "MEDIUM"
    return "HIGH" if v >= 0.8 else "MEDIUM" if v >= 0.5 else "LOW"


def issue_topic_from(claim: str) -> str:
    """Short single-line topic derived from the claim (display title)."""
    text = " ".join((claim or "").split())
    if len(text) <= 80:
        return text
    cut = text[:77].rsplit(" ", 1)[0]
    return cut + "…"


def directions_list(raw: str) -> list[str]:
    return [CODE_TO_APP_DIRECTION[c.strip()]
            for c in (raw or "").split(",")
            if c.strip() in CODE_TO_APP_DIRECTION]


def entry_from_app_fields(row: dict, idx: int) -> dict:
    """Lossless round trip for Vastu Chintamani facts (source_app_* columns)."""
    chapter = (row.get("chapter") or "").split(" / ", 1)
    return {
        "id": idx,
        "category": row.get("source_app_category") or "Vastu Principles",
        "subcategory": row.get("subcategory") or "",
        "issue_topic": row.get("source_app_issue_topic") or "",
        "description": row.get("description") or "",
        "recommendation": row.get("source_app_recommendation") or "",
        "remedy": row.get("remedy") or None,
        "mantra_spiritual_practice": row.get("source_app_mantra") or None,
        "expected_effect": row.get("source_app_expected_effect") or None,
        "chapter": chapter[0] or None,
        "section": chapter[1] if len(chapter) > 1 else None,
        "page_number": row.get("page") or None,
        "source_text": row.get("claim") or "",
        "confidence": row.get("source_app_confidence") or confidence_label(row.get("confidence")),
        "verification_status": row.get("source_app_verified") or "SOURCE_VERIFIED",
        "source_book": row.get("title") or "Vastu Chintamani",
        "directions": directions_list(row.get("direction") or ""),
        "pipeline_fact_id": row.get("id") or None,
    }


def entry_from_fact(row: dict, idx: int) -> dict:
    """Derived app-entry shape for facts from other (staged) sources."""
    status = (row.get("verification_status") or "unverified").upper()
    return {
        "id": idx,
        "category": app_category(row.get("category") or ""),
        "subcategory": row.get("subcategory") or "",
        "issue_topic": issue_topic_from(row.get("claim") or ""),
        "description": row.get("description") or "",
        "recommendation": "",
        "remedy": row.get("remedy") or None,
        "mantra_spiritual_practice": None,
        "expected_effect": None,
        "chapter": row.get("chapter") or None,
        "section": None,
        "page_number": row.get("page") or None,
        "source_text": row.get("claim") or "",
        "confidence": confidence_label(row.get("confidence")),
        "verification_status": "SOURCE_VERIFIED" if status == "SOURCE_VERIFIED" else status,
        "source_book": row.get("title") or "",
        "directions": directions_list(row.get("direction") or ""),
        "pipeline_fact_id": row.get("id") or None,
    }


def load_rows() -> list[dict]:
    """All source facts (interpretation/app_rule records are app-unfriendly; excluded)."""
    with db.connect() as conn:
        db.init_db(conn)
        cols = "f.*, s.title"
        chint = [dict(r) for r in conn.execute(
            f"SELECT {cols} FROM facts f LEFT JOIN sources s ON s.source_id = f.source_id "
            "WHERE f.source_id = ? AND f.record_type = 'source_fact' "
            "ORDER BY CAST(SUBSTR(f.id, -3) AS INTEGER)",
            (CHINTAMANI,),
        ).fetchall()]
        others = [dict(r) for r in conn.execute(
            f"SELECT {cols} FROM facts f LEFT JOIN sources s ON s.source_id = f.source_id "
            "WHERE f.source_id != ? AND f.record_type = 'source_fact' "
            "ORDER BY f.source_id, f.id",
            (CHINTAMANI,),
        ).fetchall()]
    return chint + others


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="exit 1 without writing if the app dataset is stale")
    args = ap.parse_args()

    rows = load_rows()
    if not rows:
        print("✗ no facts in the DB — run the pipeline (or import_vastu_entries.py) first")
        sys.exit(1)

    entries = []
    for i, row in enumerate(rows, start=1):
        if row.get("source_id") == CHINTAMANI:
            entries.append(entry_from_app_fields(row, i))
        else:
            entries.append(entry_from_fact(row, i))

    stats = {
        "total": len(entries),
        "withRemedies": sum(1 for e in entries if e["remedy"]),
        "withMantras": sum(1 for e in entries if e["mantra_spiritual_practice"]),
        "verified": sum(1 for e in entries if e["verification_status"] == "SOURCE_VERIFIED"),
    }
    payload = {"stats": stats, "entries": entries}
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"

    current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    if current == text:
        print(f"✓ app dataset already up to date ({len(entries)} entries) — {OUT.name}")
        return
    if args.check:
        print("✗ app dataset is STALE — regenerate with: "
              ".venv/Scripts/python scripts/build_app_dataset.py")
        sys.exit(1)

    OUT.write_text(text, encoding="utf-8")
    print(f"✓ wrote {len(entries)} entries → {OUT.relative_to(OUT.parents[2])}")
    print(f"  stats: {stats}")


if __name__ == "__main__":
    main()
