#!/usr/bin/env python3
"""Regenerate the Vastu Compass app dataset from the pipeline database.

Single source of truth: the pipeline staging DB (vastu_pipeline.sqlite3) holds
every Vastu Chintamani fact with the original app-entry fields preserved
(source_app_* columns, set by import_vastu_entries.py). This script rebuilds
  ../src/data/vastuEntries.json
from those facts, so the app and the exported dataset can never drift.

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

SOURCE_ID = "VASTU-CHINTAMANI-001"
OUT = ROOT.parent / "src" / "data" / "vastuEntries.json"

CODE_TO_APP_DIRECTION = {
    "N": "North", "NE": "North-East", "E": "East", "SE": "South-East",
    "S": "South", "SW": "South-West", "W": "West", "NW": "North-West",
}


def build_entry(row: dict, idx: int) -> dict:
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
        "chapter": (row.get("chapter") or "").split(" / ")[0] or None,
        "section": (row.get("chapter") or "").split(" / ", 1)[1] if " / " in (row.get("chapter") or "") else None,
        "page_number": row.get("page") or None,
        "source_text": row.get("claim") or "",
        "confidence": row.get("source_app_confidence") or "MEDIUM",
        "verification_status": row.get("source_app_verified") or "SOURCE_VERIFIED",
        "source_book": "Vastu Chintamani",
        "directions": [CODE_TO_APP_DIRECTION[c.strip()]
                       for c in (row.get("direction") or "").split(",")
                       if c.strip() in CODE_TO_APP_DIRECTION],
        "pipeline_fact_id": row.get("id") or None,
        "created_at": row.get("created_at") or "",
        "updated_at": row.get("updated_at") or "",
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="exit 1 without writing if the app dataset is stale")
    args = ap.parse_args()

    with db.connect() as conn:
        db.init_db(conn)
        rows = [dict(r) for r in conn.execute(
            "SELECT * FROM facts WHERE source_id = ? "
            "ORDER BY CAST(SUBSTR(id, -3) AS INTEGER)",  # e001..eNNN suffix = original order
            (SOURCE_ID,)
        ).fetchall()]

    if not rows:
        print(f"✗ no {SOURCE_ID} facts in the DB — run scripts/import_vastu_entries.py first")
        sys.exit(1)

    entries = [build_entry(r, i + 1) for i, r in enumerate(rows)]
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
        print(f"✗ app dataset is STALE — regenerate with: "
              f".venv/Scripts/python scripts/build_app_dataset.py")
        sys.exit(1)

    OUT.write_text(text, encoding="utf-8")
    print(f"✓ wrote {len(entries)} entries → {OUT.relative_to(OUT.parents[2])}")
    print(f"  stats: {stats}")


if __name__ == "__main__":
    main()
