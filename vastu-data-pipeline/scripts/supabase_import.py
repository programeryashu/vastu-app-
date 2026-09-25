#!/usr/bin/env python3
"""Optional Supabase import layer (feature 11).

Dry-run by default:
    python scripts/supabase_import.py --dry-run
Live (requires SUPABASE_URL + SUPABASE_KEY in .env):
    python scripts/supabase_import.py --live

Tables: sources, chapters, vastu_facts, directions, rooms, remedies, terms,
source_references. Every fact carries its source_reference.
Migration SQL: schemas/supabase_schema.sql (run once in the Supabase SQL editor).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from vdp import db, paths  # noqa: E402


def load_env() -> dict:
    env_path = ROOT / ".env"
    vals = dict(os.environ)
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                vals.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return vals


def _rows_for_import(conn) -> dict:
    """Collect rows for every table; returns {table: [row, ...]}."""
    sources = [dict(r) for r in db.list_sources(conn)]
    facts_raw = db.all_facts(conn, include_rejected=True)
    src_by_id = {s["source_id"]: s for s in sources}

    chapters = []
    seen_ch = set()
    for s in sources:
        cur = conn.execute(
            "SELECT DISTINCT chapter FROM blocks WHERE source_id=? AND chapter != ''",
            (s["source_id"],),
        ).fetchall()
        for c in cur:
            key = (s["source_id"], c["chapter"])
            if key not in seen_ch:
                seen_ch.add(key)
                chapters.append({
                    "source_id": s["source_id"], "title": c["chapter"],
                })

    directions, rooms, remedies, terms = [], [], [], []
    seen = {"directions": set(), "rooms": set(), "remedies": set(), "terms": set()}
    facts, refs = [], []
    for f in facts_raw:
        src = src_by_id.get(f["source_id"], {})
        facts.append({
            "id": f["id"],
            "source_id": f["source_id"],
            "record_type": f.get("record_type", "source_fact"),
            "interpretation_note": f.get("interpretation_note"),
            "topic": f.get("topic", ""),
            "subcategory": f.get("subcategory", ""),
            "claim": f.get("claim", ""),
            "description": f.get("description", ""),
            "direction": f.get("direction", ""),
            "room": f.get("room", ""),
            "element": f.get("element", ""),
            "planet": f.get("planet", ""),
            "remedy": f.get("remedy", ""),
            "conditions": f.get("conditions", []),
            "language": f.get("language", "en"),
            "confidence": f.get("confidence", 0.0),
            "verification_status": f.get("verification_status", "unverified"),
            "review_notes": f.get("review_notes", ""),
        })
        refs.append({
            "fact_id": f["id"],
            "source_id": f["source_id"],
            "chapter": f.get("chapter", ""),
            "page": f.get("page", ""),
            "original_text": f.get("original_text", ""),
        })
        if f.get("direction") and f["direction"] not in seen["directions"]:
            seen["directions"].add(f["direction"])
            directions.append({"name": f["direction"]})
        if f.get("room") and f["room"] not in seen["rooms"]:
            seen["rooms"].add(f["room"])
            rooms.append({"name": f["room"]})
        if f.get("remedy"):
            remedies.append({
                "fact_id": f["id"], "source_id": f["source_id"],
                "text": f["remedy"], "direction": f.get("direction", ""),
                "room": f.get("room", ""),
            })
        if f.get("topic") == "terminology" or f.get("subcategory") == "terminology":
            terms.append({
                "fact_id": f["id"], "term": f.get("claim", "")[:80],
                "meaning": f.get("description", ""),
                "source_id": f["source_id"],
            })

    return {
        "sources": sources,
        "chapters": chapters,
        "vastu_facts": facts,
        "directions": directions,
        "rooms": rooms,
        "remedies": remedies,
        "terms": terms,
        "source_references": refs,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", action="store_true", help="actually push to Supabase")
    ap.add_argument("--table", help="limit to one table")
    args = ap.parse_args()

    settings = paths.load_settings()
    with db.connect() as conn:
        db.init_db(conn)
        payload = _rows_for_import(conn)

    if args.table:
        payload = {args.table: payload.get(args.table, [])}

    total = sum(len(v) for v in payload.values())
    print(f"import plan: " + ", ".join(f"{k}={len(v)}" for k, v in payload.items()))
    print(f"total rows: {total}")

    if not args.live:
        out = paths.logs_dir() / "supabase_dry_run.json"
        out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"dry-run payload written to {out} (no network calls). "
              f"Use --live (with .env SUPABASE_URL/SUPABASE_KEY) to push.")
        return

    env = load_env()
    url, key = env.get("SUPABASE_URL"), env.get("SUPABASE_KEY")
    if not url or not key or "your-project" in url:
        print("✗ SUPABASE_URL / SUPABASE_KEY missing in .env — see .env.example")
        sys.exit(1)
    try:
        from supabase import create_client
    except ImportError:
        print("✗ supabase python client not installed: pip install supabase")
        sys.exit(1)

    client = create_client(url, key)
    # Insert order respects FKs: sources → facts/refs → rest
    order = ["sources", "vastu_facts", "source_references", "chapters",
             "directions", "rooms", "remedies", "terms"]
    for table in order:
        rows = payload.get(table, [])
        if not rows:
            print(f"  {table}: 0 rows, skip")
            continue
        for i in range(0, len(rows), 200):
            chunk = rows[i:i + 200]
            client.table(table).upsert(chunk).execute()
        print(f"  {table}: {len(rows)} row(s) upserted")
    print("✓ Supabase import complete")


if __name__ == "__main__":
    main()
