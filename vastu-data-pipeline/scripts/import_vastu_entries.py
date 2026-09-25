#!/usr/bin/env python3
"""Import the Vastu Compass app dataset (Vastu Chintamani entries) into the pipeline.

Reads  ../src/data/vastuEntries.json  (53 entries extracted from
the user's own copy of *Vastu Chintamani*) and creates pipeline facts:

  record_type   = source_fact (claim = verbatim Hindi source_text)
  description   = the English description from the app data
  direction     = normalized from the entry's directions list
  remedy/mantra = carried over verbatim
  source        = VASTU-CHINTAMANI-001, chapter+section, original_text=source_text
  page          = only if present (never invented — validation warns otherwise)

Review state is left 'unverified' (with the app's SOURCE_VERIFIED flag noted)
so every record passes through the review UI once.

Usage:
  python scripts/import_vastu_entries.py [--src ../src/data/vastuEntries.json]
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

from vdp import db, registry  # noqa: E402
from vdp.models import SourceRecord, StagedFact, SourceRef  # noqa: E402
from vdp.textutils import short_hash  # noqa: E402

SOURCE_ID = "VASTU-CHINTAMANI-001"
DEFAULT_SRC = ROOT.parent / "src" / "data" / "vastuEntries.json"

CATEGORY_MAP = {
    "Vastu Principles": "principles",
    "Vastu Defects / Problems": "defects",
    "Spiritual Practice / Ritual": "mantras",
    "Directions and Their Significance": "direction",
    "Room Placement Recommendations": "room",
    "Remedies / Corrective Actions": "remedies",
    "Mantras / Prayers / Rituals": "mantras",
}

DIR_MAP = {
    "north": "N", "north-east": "NE", "northeast": "NE", "east": "E",
    "south-east": "SE", "southeast": "SE", "south": "S",
    "south-west": "SW", "southwest": "SW", "west": "W",
    "north-west": "NW", "northwest": "NW",
    "centre": "center", "center": "center", "brahmasthan": "center",
}

CONF_MAP = {"HIGH": 0.9, "MEDIUM": 0.6, "LOW": 0.3}


def norm_directions(raw) -> str:
    """'["East","West"]' (JSON string or list) → 'E,W'."""
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            raw = [raw]
    out = []
    for d in raw or []:
        code = DIR_MAP.get(str(d).strip().lower())
        if code and code not in out:
            out.append(code)
    return ",".join(out)


def detect_room(text: str) -> str:
    from vdp.classify import ROOM_PATTERNS

    for name, pat in ROOM_PATTERNS:
        if pat.search(text):
            return name
    return ""


def detect_element(text: str) -> str:
    from vdp.classify import ELEMENT_PATTERNS

    for name, pat in ELEMENT_PATTERNS:
        if pat.search(text):
            return name
    return ""


def detect_planet(text: str) -> str:
    from vdp.classify import PLANET_PATTERNS

    for name, pat in PLANET_PATTERNS:
        if pat.search(text):
            return name
    return ""


def convert(entry: dict) -> StagedFact:
    eid = entry.get("id")
    source_text = (entry.get("source_text") or "").strip()
    if not source_text:
        raise ValueError(f"entry {eid}: source_text missing — refusing to import untraceable fact")

    description = (entry.get("description") or "").strip()
    remedy = (entry.get("remedy") or "").strip()
    mantra = (entry.get("mantra_spiritual_practice") or "").strip()
    recommendation = (entry.get("recommendation") or "").strip()

    hay = " ".join(filter(None, [
        entry.get("subcategory", ""), entry.get("issue_topic", ""),
        description, remedy, mantra, source_text,
    ]))

    category = CATEGORY_MAP.get(entry.get("category", ""), "principles")
    directions = norm_directions(entry.get("directions"))
    page = entry.get("page_number")
    chapter = " / ".join(filter(None, [entry.get("chapter", ""), entry.get("section", "")]))

    conf = CONF_MAP.get(str(entry.get("confidence", "")).upper(), 0.5)

    fid = f"{SOURCE_ID}::{short_hash(source_text, 10)}::e{int(eid):03d}"

    return StagedFact(
        id=fid,
        record_type="source_fact",
        topic=category,
        subcategory=(entry.get("subcategory") or "").strip() or category,
        category=category,
        claim=source_text,           # verbatim Hindi — what the source actually says
        description=description,     # English description from the app data, verbatim
        direction=directions,
        room=detect_room(hay),
        element=detect_element(hay),
        planet=detect_planet(hay),
        remedy=remedy,
        conditions=[],
        source=SourceRef(
            source_id=SOURCE_ID,
            title="Vastu Chintamani",
            author="",                # not present in app data — never invented
            chapter=chapter,
            page=str(page) if page is not None else "",
            original_text=source_text,
        ),
        language="hi",               # claim is the Hindi source text
        confidence=conf,
        verification_status="unverified",
        review_notes=(
            f"imported from VastuCompass app data "
            f"(app flag: {entry.get('verification_status', 'n/a')})"
        ),
        # round-trip: keep the original app-entry fields so build_app_dataset.py
        # can regenerate the app dataset from the pipeline without information loss
        source_app_category=entry.get("category", ""),
        source_app_issue_topic=entry.get("issue_topic", ""),
        source_app_recommendation=recommendation,
        source_app_mantra=mantra,
        source_app_expected_effect=entry.get("expected_effect", "") or "",
        source_app_confidence=str(entry.get("confidence", "")),
        source_app_verified=str(entry.get("verification_status", "")),
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=str(DEFAULT_SRC))
    args = ap.parse_args()

    src_path = Path(args.src)
    if not src_path.exists():
        print(f"✗ source file not found: {src_path}")
        sys.exit(1)

    data = json.loads(src_path.read_text(encoding="utf-8"))
    entries = data.get("entries", [])
    if not entries:
        print("✗ no entries found in file")
        sys.exit(1)

    # 1) register the source (owned license — user's own book data)
    rec = SourceRecord(
        source_id=SOURCE_ID,
        title="Vastu Chintamani",
        author="",
        language="hi",
        source_type="other",
        location=str(src_path.relative_to(ROOT.parent)) if src_path.is_relative_to(ROOT.parent) else str(src_path),
        license_status="owned",
        notes=f"{len(entries)} entries extracted from the user's own copy; "
              f"imported via import_vastu_entries.py",
    )
    with db.connect() as conn:
        db.init_db(conn)
        db.upsert_source(conn, rec)

        # keep the registry CSV in sync
        rows = registry.load_csv(ROOT)
        rows = [r for r in rows if r.source_id != SOURCE_ID] + [rec]
        import csv as _csv
        fields = list(SourceRecord.model_fields.keys())
        with open(registry.registry_path(ROOT), "w", newline="", encoding="utf-8-sig") as f:
            w = _csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            for r in rows:
                w.writerow({k: ("" if v is None else v) for k, v in r.model_dump().items()})

        # 2) convert + stage every entry
        added, skipped = 0, []
        for e in entries:
            try:
                fact = convert(e)
            except ValueError as err:
                skipped.append(str(err))
                continue
            db.insert_fact(conn, fact)
            db.log_action(conn, fact.id, "note", field="import",
                          old="", new=f"imported entry id={e.get('id')}", by="importer")
            added += 1

    print(f"✓ source registered: {SOURCE_ID} (license_status=owned)")
    print(f"✓ imported {added} fact(s) from {len(entries)} app entries")
    if skipped:
        print(f"⚠ skipped {len(skipped)}: " + "; ".join(skipped))
    print("next: dedupe → validate → export (review in review_app.py)")


if __name__ == "__main__":
    main()
