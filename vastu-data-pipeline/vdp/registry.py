"""Source registry (feature 1): CSV import/export + DB sync + license audit."""

from __future__ import annotations

import csv
from pathlib import Path

from . import db
from .models import SourceRecord

REGISTRY_CSV = "source_registry.csv"

REQUIRED_COLUMNS = ["source_id", "title", "license_status", "location"]


def registry_path(root: Path) -> Path:
    return root / REGISTRY_CSV


def write_template(root: Path) -> Path:
    """Create a starter CSV with one commented example row (as data row)."""
    p = registry_path(root)
    if p.exists():
        return p
    example = SourceRecord(
        source_id="EXAMPLE-001",
        title="Example: delete this row and add your own sources",
        author="",
        language="en",
        source_type="pdf",
        location="sources/your-file.pdf",
        license_status="owned",
        notes="Use license_status: public_domain | licensed | owned | permitted_web | unknown",
    )
    _write_csv(p, [example])
    return p


def _write_csv(p: Path, records: list[SourceRecord]) -> None:
    fields = list(SourceRecord.model_fields.keys())
    with open(p, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in records:
            w.writerow({k: ("" if v is None else v) for k, v in r.model_dump().items()})


def load_csv(root: Path) -> list[SourceRecord]:
    p = registry_path(root)
    if not p.exists():
        return []
    out: list[SourceRecord] = []
    with open(p, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            row = {k: (v or "").strip() for k, v in row.items() if k}
            missing = [c for c in REQUIRED_COLUMNS if not row.get(c)]
            if missing:
                raise ValueError(f"{p.name}: row missing required fields {missing}: {row}")
            year = row.get("publication_year") or ""
            rec = SourceRecord(
                **{
                    **row,
                    "publication_year": int(year) if str(year).isdigit() else None,
                }
            )
            out.append(rec)
    return out


def sync_to_db(conn) -> tuple[int, int]:
    """Import CSV registry into SQLite; returns (imported, total_in_db)."""
    root = Path(__file__).resolve().parents[1]
    records = load_csv(root)
    for r in records:
        db.upsert_source(conn, r)
    return len(records), len(db.list_sources(conn))


def export_registry(conn, out_path: Path) -> int:
    """Write source_registry.json dataset file."""
    rows = [dict(r) for r in db.list_sources(conn)]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        import json
        json.dump(rows, f, ensure_ascii=False, indent=2)
    return len(rows)


def audit_unknown_licenses(conn) -> list[dict]:
    """Sources whose license status is 'unknown' — blocked from export by default."""
    return [
        dict(r)
        for r in conn.execute("SELECT * FROM sources WHERE license_status = 'unknown'")
    ]
