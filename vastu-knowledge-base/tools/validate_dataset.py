#!/usr/bin/env python3
"""North Indian Vastu Knowledge Base — dataset validator.

QC per 00_ARCHITECTURE.md §18 (and the Rajavallabha Nighantu integration spec):
valid JSON/UTF-8, unique stable IDs, source linkage, cross-link references,
no accidental changes to existing records, section bookkeeping consistency.

Exit code 1 if any FAIL. Run: python tools/validate_dataset.py [--backup DIR]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RESULTS: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    RESULTS.append((name, ok, detail))
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f" — {detail}" if detail else ""))


def load(path: Path):
    raw = path.read_bytes()
    text = raw.decode("utf-8")  # raises on non-UTF-8
    return json.loads(text), text


def collect_ids(node, out: dict, where: str) -> None:
    """Map every 'id' field occurrence to its location (first wins)."""
    if isinstance(node, dict):
        rid = node.get("id")
        if isinstance(rid, str) and rid:
            out.setdefault(rid, where)
        for k, v in node.items():
            collect_ids(v, out, f"{where}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            collect_ids(v, out, f"{where}[{i}]")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--backup", default="", help="backup dir to diff existing records against")
    args = ap.parse_args()

    files = sorted(p for p in ROOT.glob("*.json"))
    data: dict[str, dict] = {}
    texts: dict[str, str] = {}

    # ── 1. JSON / UTF-8 validity ──
    ok = True
    detail = []
    for p in files:
        try:
            data[p.name], texts[p.name] = load(p)
        except Exception as e:  # noqa: BLE001
            ok = False
            detail.append(f"{p.name}: {e}")
    check("JSON validation (valid JSON + UTF-8)", ok, "; ".join(detail))

    # ── 2. Unique IDs across the whole dataset ──
    all_ids: dict[str, str] = {}
    for name, doc in data.items():
        collect_ids(doc, all_ids, name)
    dupes = sorted({rid for rid, where in all_ids.items()
                    if sum(1 for w in all_ids.values() if w == all_ids[rid] and rid in w) > 1})
    # simpler: count collisions by id
    seen: dict[str, list[str]] = {}
    for name, doc in data.items():
        ids: dict[str, str] = {}
        collect_ids(doc, ids, name)
        for rid in ids:
            seen.setdefault(rid, []).append(name)
    collisions = {rid: locs for rid, locs in seen.items() if len(locs) > 1}
    check("Duplicate ID check (unique across files)", not collisions,
          ", ".join(f"{rid} in {locs}" for rid, locs in sorted(collisions.items())) or f"{len(seen)} unique IDs")

    # ── 3. Stable ID conventions (no row-number IDs) ──
    bad_ids = [rid for rid in all_ids if re.fullmatch(r"(record|row|rule|nighantu)_?\d{3,}", rid)]
    check("Stable ID convention (no row-number IDs)", not bad_ids, ", ".join(bad_ids[:5]))

    # ── 4. Source linkage: every source_id references 01_sources.json ──
    src_ids = {r["id"] for r in data.get("01_sources.json", {}).get("records", [])}
    dangling: list[str] = []
    for name, doc in data.items():
        ids: dict[str, str] = {}
        collect_ids(doc, ids, name)
        # records carrying source_id / source_ids / associated source refs
        def walk(node, where):
            if isinstance(node, dict):
                for key in ("source_id",):
                    v = node.get(key)
                    if isinstance(v, str) and v.startswith("source_") and v not in src_ids:
                        dangling.append(f"{where}: {v}")
                for k, v in node.items():
                    walk(v, f"{where}.{k}")
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk(v, f"{where}[{i}]")
        walk(doc, name)
    # source_ids lists
    for name, doc in data.items():
        for rec in doc.get("records", []):
            for sid in rec.get("source_ids", []) if isinstance(rec, dict) else []:
                if sid not in src_ids:
                    dangling.append(f"{name}:{rec.get('id', '?')}: {sid}")
    check("Source linkage check (all source refs exist)", not dangling, "; ".join(dangling[:5]) or f"{len(src_ids)} sources known")

    # ── 5. Cross-link references (directions / spaces / elements) ──
    known = set()
    for fname in ("02_directions.json", "03_spaces.json", "03b_elements.json"):
        for rec in data.get(fname, {}).get("records", []):
            known.add(rec.get("id"))
    known.discard(None)
    broken: list[str] = []
    for name, doc in data.items():
        if name.startswith(("01_", "02_", "03_")):
            continue

        def walk_links(node, where):
            if isinstance(node, dict):
                for key in ("associated_directions", "associated_spaces", "associated_objects",
                            "direction_ids", "space_ids"):
                    for ref in node.get(key, []) or []:
                        if isinstance(ref, str) and ref.startswith(("direction_", "space_", "element_")) \
                                and ref not in known:
                            broken.append(f"{where}: {ref}")
                for k, v in node.items():
                    walk_links(v, f"{where}.{k}")
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk_links(v, f"{where}[{i}]")
        walk_links(doc, name)
    check("Broken reference check (cross-links resolve)", not broken, "; ".join(broken[:5]) or f"{len(known)} taxonomy IDs known")

    # ── 6. Rajavallabha Nighantu section integrity ──
    rn = data.get("11_rajavallabha_nighantu.json")
    if rn:
        problems = []
        WORK = "source_rajavallabha_nighantu"
        # records may cite the work itself or any registered edition of it
        allowed_src = {WORK} | {
            r["id"] for r in data.get("01_sources.json", {}).get("records", [])
            if r.get("edition_of") == WORK
        }
        if rn.get("source_id") != WORK:
            problems.append("source_id mismatch")
        vocab = set(rn.get("entry_type_vocabulary", []))
        for rec in rn.get("records", []):
            rid = rec.get("id", "?")
            if rec.get("source_id") not in allowed_src:
                problems.append(f"{rid}: wrong source_id ({rec.get('source_id')})")
            if vocab and rec.get("entry_type") not in vocab:
                problems.append(f"{rid}: entry_type '{rec.get('entry_type')}' not in vocabulary")
            if rec.get("vastu_relevance") not in ("none", "potential", "explicit", None):
                problems.append(f"{rid}: bad vastu_relevance")
            if not rec.get("original_text"):
                problems.append(f"{rid}: missing original_text")
            if rec.get("claim_type") not in ("direct_source_claim", None):
                problems.append(f"{rid}: claim_type must be direct_source_claim (no scientific upgrade)")
            sr = rec.get("source_reference") or {}
            if not any(str(sr.get(k, "")).strip() for k in ("page", "chapter", "verse", "entry")) \
                    and rec.get("source_reference_status") != "not_available":
                problems.append(f"{rid}: no location and no source_reference_status")
        n = len(rn.get("records", []))
        stated = rn.get("integration_status", {}).get("records_present")
        if stated is not None and stated != n:
            problems.append(f"integration_status.records_present={stated} but file has {n} records")
        check("Rajavallabha Nighantu isolation + record rules", not problems,
              "; ".join(problems[:5]) or f"{n} record(s) conform")
    else:
        check("Rajavallabha Nighantu isolation + record rules", True, "section file not present yet")

    # ── 7. Existing dataset preservation (diff against backup) ──
    if args.backup:
        bdir = Path(args.backup)
        drifted = []
        for fname in ("01_sources.json", "02_directions.json", "03_spaces.json"):
            cur, bak = ROOT / fname, bdir / fname
            if not bak.exists():
                continue
            cur_recs = {r["id"]: r for r in load(cur)[0].get("records", [])}
            bak_recs = {r["id"]: r for r in load(bak)[0].get("records", [])}
            for rid, old in bak_recs.items():
                if rid not in cur_recs:
                    drifted.append(f"{fname}: record {rid} REMOVED")
                elif cur_recs[rid] != old:
                    drifted.append(f"{fname}: record {rid} modified")
            check(f"{fname}: no existing records lost", not [d for d in drifted if d.startswith(fname)],
                  "; ".join(d for d in drifted if d.startswith(fname)) or f"{len(bak_recs)} record(s) intact")
    else:
        print("SKIP  Existing dataset preservation (no --backup given)")

    # ── summary ──
    fails = [name for name, ok, _ in RESULTS if not ok]
    print()
    if fails:
        print(f"RESULT: FAIL ({len(fails)}): " + ", ".join(fails))
        sys.exit(1)
    print("RESULT: ALL PASS")


if __name__ == "__main__":
    main()
