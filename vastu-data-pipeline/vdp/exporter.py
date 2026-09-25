"""Feature 10 — dataset export (JSON / JSONL) + cleaned full copies.

Exports include only facts whose source license_status != 'unknown'
(license audit gate). Reviewers' rejections are excluded by default.
"""

from __future__ import annotations

import json
from pathlib import Path

from . import db
from .models import StagedFact

EXPORT_FIELDS = [
    "id", "topic", "subcategory", "claim", "description", "direction", "room",
    "element", "planet", "remedy", "conditions", "source", "language",
    "confidence", "verification_status",
]


def _fact_public(f: dict) -> dict:
    """User-documented public shape (feature 5) — ordered fields only."""
    src = f.get("source") or {}
    if not isinstance(src, dict):
        src = {}
    pub = {
        "id": f["id"],
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
        "source": {
            "source_id": src.get("source_id") or f.get("source_id", ""),
            "title": src.get("title") or f.get("title", ""),
            "author": src.get("author") or f.get("author", ""),
            "chapter": src.get("chapter") or f.get("chapter", ""),
            "page": str(src.get("page") or f.get("page", "") or ""),
            "original_text": src.get("original_text") or f.get("original_text", ""),
        },
        "language": f.get("language", "en"),
        "confidence": round(float(f.get("confidence") or 0.0), 3),
        "verification_status": f.get("verification_status", "unverified"),
    }
    return pub


def _fact_full(f: dict) -> dict:
    """Superset incl. dedupe/review/traceability — lives in cleaned/."""
    pub = _fact_public(f)
    for k in ("record_type", "interpretation_note", "canonical_record_id",
              "duplicate_of", "similarity_score", "conflict_group",
              "variant_group", "review_notes", "reviewed_by", "reviewed_at",
              "chunk_id", "ocr_confidence"):
        pub[k] = f.get(k)
    return pub


def _write_json(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def export_all(conn, settings: dict, include_rejected: bool = False,
               allow_unknown_license: bool = False) -> dict[str, int]:
    root = Path(__file__).resolve().parents[1]
    ds = root / settings["paths"]["datasets"]
    cleaned = root / settings["paths"]["cleaned"]
    files = settings["export"]["files"]

    sources = {r["source_id"]: dict(r) for r in db.list_sources(conn)}
    if not allow_unknown_license:
        blocked = {sid for sid, s in sources.items() if s["license_status"] == "unknown"}
    else:
        blocked = set()

    facts = [f for f in db.all_facts(conn, include_rejected=include_rejected)
             if f["source_id"] not in blocked]

    # hydrate source dict for citation
    for f in facts:
        f.setdefault("source", sources.get(f["source_id"], {}))

    pubs = [_fact_public(f) for f in facts]
    fulls = [_fact_full(f) for f in facts]

    counts: dict[str, int] = {}

    _write_json(ds / files["facts"], pubs)
    _write_jsonl(ds / files["facts_jsonl"], pubs)
    counts["facts"] = len(pubs)

    def subset(pred):
        rows = [_fact_public(f) for f in facts if pred(f)]
        fulls_sub = [_fact_full(f) for f in facts if pred(f)]
        return rows, fulls_sub

    terms, terms_full = subset(lambda f: f.get("topic") == "terminology" or f.get("category") == "terminology")
    remedies, rem_full = subset(lambda f: bool(f.get("remedy")) or f.get("topic") == "remedies")
    directions, dir_full = subset(lambda f: bool(f.get("direction")))
    rooms, room_full = subset(lambda f: bool(f.get("room")))

    _write_json(ds / files["terms"], terms)
    _write_json(ds / files["remedies"], remedies)
    _write_json(ds / files["directions"], directions)
    _write_json(ds / files["rooms"], rooms)
    counts.update(terms=len(terms), remedies=len(remedies),
                  directions=len(directions), rooms=len(rooms))

    # cleaned full copies (with dedupe/review metadata)
    _write_jsonl(cleaned / "facts_full.jsonl", fulls)
    _write_jsonl(cleaned / "terms_full.jsonl", terms_full)
    _write_jsonl(cleaned / "remedies_full.jsonl", rem_full)
    _write_jsonl(cleaned / "directions_full.jsonl", dir_full)
    _write_jsonl(cleaned / "rooms_full.jsonl", room_full)

    counts["source_registry"] = db_registry_export(conn, ds / files["source_registry"])
    return counts


def db_registry_export(conn, path: Path) -> int:
    from .registry import export_registry
    return export_registry(conn, path)
