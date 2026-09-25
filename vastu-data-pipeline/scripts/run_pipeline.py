#!/usr/bin/env python3
"""vastu-data-pipeline CLI — extraction, staging, dedupe, validation, export.

Local-first: SQLite staging at pipeline root; outputs under extracted/,
cleaned/, datasets/. Run `python scripts/run_pipeline.py --help`.

Typical flow:
    python scripts/run_pipeline.py init
    (edit source_registry.csv — one row per book/file; set license_status)
    python scripts/run_pipeline.py make-samples          # optional demo docs
    python scripts/run_pipeline.py register
    python scripts/run_pipeline.py extract
    python scripts/run_pipeline.py stage
    python scripts/run_pipeline.py dedupe
    python scripts/run_pipeline.py validate
    python scripts/run_pipeline.py export
or simply:
    python scripts/run_pipeline.py run-all
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Windows consoles default to cp1252; our output uses ✓/⚠ glyphs.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass

from vdp import db, dedupe, exporter, extract, paths, registry, stage, validate  # noqa: E402
from vdp import translate as translation  # noqa: E402
from vdp.models import StagedFact  # noqa: E402


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _log(msg: str) -> None:
    print(msg, flush=True)
    logdir = paths.logs_dir()
    with open(logdir / "pipeline.log", "a", encoding="utf-8") as f:
        f.write(f"{_now()} {msg}\n")


def _run_stage(conn, stage_name: str, fn, *args):
    """Record a pipeline_runs row around a stage."""
    cur = conn.execute(
        "INSERT INTO pipeline_runs (stage, started_at) VALUES (?, ?)",
        (stage_name, _now()),
    )
    run_id = cur.lastrowid
    try:
        result = fn(conn, *args)
        conn.execute(
            "UPDATE pipeline_runs SET finished_at = ?, stats_json = ? WHERE run_id = ?",
            (_now(), json.dumps(result if isinstance(result, dict) else {"result": str(result)}), run_id),
        )
        return result
    except Exception as e:
        conn.execute(
            "UPDATE pipeline_runs SET finished_at = ? WHERE run_id = ?",
            (_now(), run_id),
        )
        raise


# ───────────────────────────── commands ─────────────────────────────


def cmd_init(args) -> None:
    settings = paths.load_settings()
    dirs = paths.ensure_dirs(settings)
    with db.connect() as conn:
        db.init_db(conn)
    tpl = registry.write_template(ROOT)
    for name, p in dirs.items():
        _log(f"dir  ready: {name:10s} -> {p.name}/")
    _log(f"db   ready: {paths.db_path(settings).name}")
    _log(f"csv  ready: {tpl.name}  (edit it: one row per source)")


def cmd_make_samples(args) -> None:
    """Generate sample local documents + registry rows for testing."""
    import make_samples  # scripts/make_samples.py, same dir
    make_samples.main()


def cmd_register(args) -> None:
    with db.connect() as conn:
        db.init_db(conn)
        imported, total = registry.sync_to_db(conn)
        unknown = registry.audit_unknown_licenses(conn)
    _log(f"registry: imported {imported} row(s); {total} source(s) in DB")
    if unknown:
        _log(f"⚠ {len(unknown)} source(s) have license_status='unknown' "
             f"(excluded from export): " + ", ".join(s["source_id"] for s in unknown))


def _resolve_location(location: str) -> Path | None:
    p = Path(location)
    if not p.is_absolute():
        p = ROOT / p
    return p if p.exists() else None


def cmd_extract(args) -> None:
    settings = paths.load_settings()
    dirs = paths.ensure_dirs(settings)
    extracted_dir = dirs["extracted"]

    with db.connect() as conn:
        db.init_db(conn)

        def do(conn):
            rows = conn.execute(
                "SELECT * FROM sources WHERE extraction_status IN ('pending','ocr_required','failed')"
            ).fetchall()
            if getattr(args, "source_id", None):
                rows = [r for r in rows if r["source_id"] == args.source_id]
            stats = {"sources": 0, "blocks": 0, "ocr_sources": 0, "failed": []}
            for src in rows:
                sid = src["source_id"]
                path = _resolve_location(src["location"])
                if path is None:
                    _log(f"✗ {sid}: file not found: {src['location']}")
                    conn.execute("UPDATE sources SET extraction_status='failed', updated_at=? WHERE source_id=?",
                                 (_now(), sid))
                    stats["failed"].append(sid)
                    continue
                try:
                    result = extract.extract_any(path, src["source_type"], sid, settings)
                except RuntimeError as e:
                    # Tesseract missing (or similar recoverable env gap) → ocr_required
                    _log(f"⏸ {sid}: needs setup — {e}")
                    conn.execute("UPDATE sources SET extraction_status='ocr_required', updated_at=? WHERE source_id=?",
                                 (_now(), sid))
                    stats["failed"].append(sid)
                    continue
                except Exception as e:  # noqa: BLE001
                    _log(f"✗ {sid}: extraction failed: {e}")
                    conn.execute("UPDATE sources SET extraction_status='failed', updated_at=? WHERE source_id=?",
                                 (_now(), sid))
                    stats["failed"].append(sid)
                    continue
                blocks = [b.model_dump() for b in result.blocks]
                db.replace_blocks(conn, sid, result.blocks)
                out = extracted_dir / f"{sid}.jsonl"
                with open(out, "w", encoding="utf-8") as f:
                    for b in blocks:
                        f.write(json.dumps(b, ensure_ascii=False) + "\n")
                new_status = "extracted"
                if result.used_ocr:
                    new_status = "extracted"
                    stats["ocr_sources"] += 1
                conn.execute("UPDATE sources SET extraction_status=?, updated_at=? WHERE source_id=?",
                             (new_status, _now(), sid))
                stats["sources"] += 1
                stats["blocks"] += len(blocks)
                _log(f"✓ {sid}: {len(blocks)} block(s) -> {out.name}"
                     + (" (OCR used)" if result.used_ocr else ""))
            return stats

        stats = _run_stage(conn, "extract", do)
    _log(f"extract done: {stats['sources']} source(s), {stats['blocks']} block(s)"
         + (f", {stats['ocr_sources']} OCR" if stats["ocr_sources"] else "")
         + (f", FAILED: {stats['failed']}" if stats["failed"] else ""))


def cmd_stage(args) -> None:
    settings = paths.load_settings()
    dirs = paths.ensure_dirs(settings)
    cleaned_dir = dirs["cleaned"]

    with db.connect() as conn:
        db.init_db(conn)

        def do(conn):
            sources = {r["source_id"]: dict(r) for r in db.list_sources(conn)}
            stats = {"facts": 0, "by_source": {}}
            for sid, src in sources.items():
                blocks = db.blocks_for_source(conn, sid)
                if not blocks:
                    continue
                facts = stage.stage_blocks(blocks, src)
                for f in facts:
                    db.insert_fact(conn, f)
                out = cleaned_dir / f"{sid}_facts.jsonl"
                with open(out, "w", encoding="utf-8") as f:
                    for fact in facts:
                        f.write(fact.model_dump_json() + "\n")
                stats["facts"] += len(facts)
                stats["by_source"][sid] = len(facts)
                _log(f"✓ {sid}: staged {len(facts)} fact(s) -> {out.name}")
            return stats

        stats = _run_stage(conn, "stage", do)
    _log(f"stage done: {stats['facts']} fact(s) total")


def cmd_dedupe(args) -> None:
    with db.connect() as conn:
        db.init_db(conn)

        def do(conn):
            facts = db.all_facts(conn)
            anns = dedupe.find_duplicates(facts, paths.load_settings())
            applied = dedupe.apply_annotations(conn, anns)
            return {"marked": applied, "annotations": anns}

        stats = _run_stage(conn, "dedupe", do)
    _log(f"dedupe done: {stats['marked']} near-duplicate(s) marked "
         f"(nothing deleted; review in review_app)")


def cmd_validate(args) -> None:
    settings = paths.load_settings()
    with db.connect() as conn:
        db.init_db(conn)
        facts = db.all_facts(conn)
        known = {r["source_id"] for r in db.list_sources(conn)}
        results = validate.validate_facts(facts, settings, known)

        # malformed JSON check over exported datasets (if present)
        ds = ROOT / settings["paths"]["datasets"]
        json_errs = []
        if ds.exists():
            for p in sorted(ds.glob("*.json")):
                json_errs.extend(validate.validate_json_file(p))

    for e in results["errors"]:
        _log(f"ERROR   [{e['check']}] {e['id']}: {e['msg']}")
    for w in results["warnings"]:
        _log(f"WARNING [{w['check']}] {w['id']}: {w['msg']}")
    for je in json_errs:
        _log(f"ERROR   [malformed_json] {je}")

    report = {
        "checked_facts": len(facts),
        "errors": results["errors"] + [{"check": "malformed_json", "id": "-", "msg": m} for m in json_errs],
        "warnings": results["warnings"],
        "generated_at": _now(),
    }
    logdir = paths.logs_dir()
    report_path = logdir / "validation_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    _log(validate.summarize(results) + (f" (+{len(json_errs)} JSON)" if json_errs else "")
         + f" — full report: {report_path}")

    strict = settings["validation"]["fail_on_warnings"] or args.strict
    if results["errors"] or json_errs or (strict and results["warnings"]):
        sys.exit(1)


def cmd_export(args) -> None:
    settings = paths.load_settings()
    with db.connect() as conn:
        db.init_db(conn)

        def do(conn):
            counts = exporter.export_all(
                conn, settings,
                include_rejected=args.include_rejected,
                allow_unknown_license=args.allow_unknown_license,
            )
            return counts

        counts = _run_stage(conn, "export", do)
    ds = ROOT / settings["paths"]["datasets"]
    _log("export done -> datasets/: " + ", ".join(f"{k}={v}" for k, v in counts.items()))
    _log(f"files: {', '.join(sorted(p.name for p in ds.glob('*')))}")


def cmd_translate(args) -> None:
    """Add a human/AI-authored English explanation as a separate record."""
    with db.connect() as conn:
        db.init_db(conn)
        rows = conn.execute("SELECT * FROM facts WHERE id = ?", (args.fact_id,)).fetchall()
        if not rows:
            _log(f"✗ fact not found: {args.fact_id}")
            sys.exit(1)
        d = dict(rows[0])
        d["conditions"] = json.loads(d["conditions"] or "[]")
        fact = StagedFact(
            id=d["id"], record_type=d["record_type"],
            interpretation_note=d["interpretation_note"],
            topic=d["topic"], subcategory=d["subcategory"], claim=d["claim"],
            description=d["description"], direction=d["direction"], room=d["room"],
            element=d["element"], planet=d["planet"], remedy=d["remedy"],
            conditions=d["conditions"],
            source={
                "source_id": d["source_id"], "chapter": d["chapter"],
                "page": d["page"], "original_text": d["original_text"],
            },
            language=d["language"], confidence=d["confidence"],
            verification_status=d["verification_status"],
            chunk_id=d["chunk_id"], ocr_confidence=d["ocr_confidence"],
        )
        if not translation.needs_translation(fact) and not args.force:
            _log("fact does not look Hindi/Sanskrit; use --force to add anyway")
            sys.exit(1)
        interp = translation.make_translation_record(
            fact, args.en, args.hinglish or "", authored_by=args.by
        )
        db.insert_fact(conn, interp)
        db.log_action(conn, fact.id, "note", field="translation",
                      old="", new=f"added interpretation {interp.id}", by=args.by)
        _log(f"✓ interpretation record added: {interp.id} (original untouched)")


def cmd_translate_scan(args) -> None:
    """List facts that contain Hindi/Sanskrit text and may need explanations."""
    with db.connect() as conn:
        db.init_db(conn)
        facts = db.all_facts(conn)
    needing = [f for f in facts if translation.needs_translation(
        StagedFact(
            id=f["id"], claim=f["claim"], language=f["language"],
            source={"source_id": f["source_id"], "original_text": f["original_text"]},
        )
    )]
    _log(f"{len(needing)} fact(s) may need translation explanations:")
    for f in needing[: args.limit]:
        _log(f"  {f['id']}  [{f['language']}]  {f['claim'][:70]}")


def cmd_status(args) -> None:
    with db.connect() as conn:
        db.init_db(conn)
        srcs = db.list_sources(conn)
        facts = db.all_facts(conn)
    from collections import Counter
    st = Counter(s["extraction_status"] for s in srcs)
    lic = Counter(s["license_status"] for s in srcs)
    ver = Counter(f["verification_status"] for f in facts)
    _log(f"sources: {len(srcs)}  extraction={dict(st)}  license={dict(lic)}")
    _log(f"facts:   {len(facts)}  status={dict(ver)}")


def cmd_run_all(args) -> None:
    ns_extract = argparse.Namespace(source_id=None)
    ns_export = argparse.Namespace(
        include_rejected=getattr(args, "include_rejected", False),
        allow_unknown_license=getattr(args, "allow_unknown_license", False),
    )
    cmd_register(args)
    cmd_extract(ns_extract)
    cmd_stage(args)
    cmd_dedupe(args)
    cmd_validate(argparse.Namespace(strict=False))
    cmd_export(ns_export)
    _log("run-all complete. Next: review in `python scripts/review_app.py`, then `export` again.")


def main() -> None:
    ap = argparse.ArgumentParser(prog="vastu-data-pipeline",
                                 description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="create dirs, DB, registry template").set_defaults(func=cmd_init)
    sub.add_parser("make-samples", help="generate sample documents for testing").set_defaults(func=cmd_make_samples)
    sub.add_parser("register", help="sync source_registry.csv into SQLite").set_defaults(func=cmd_register)

    p = sub.add_parser("extract", help="extract blocks from pending sources")
    p.add_argument("--source-id", help="only this source")
    p.set_defaults(func=cmd_extract)

    sub.add_parser("stage", help="classify blocks into staged facts").set_defaults(func=cmd_stage)
    sub.add_parser("dedupe", help="mark near-duplicate facts").set_defaults(func=cmd_dedupe)

    p = sub.add_parser("validate", help="run all automated checks")
    p.add_argument("--strict", action="store_true", help="fail on warnings too")
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("export", help="write dataset files")
    p.add_argument("--include-rejected", action="store_true")
    p.add_argument("--allow-unknown-license", action="store_true",
                   help="export sources whose license is 'unknown' (not recommended)")
    p.set_defaults(func=cmd_export)

    p = sub.add_parser("translate", help="add an English explanation as an interpretation record")
    p.add_argument("--fact-id", required=True)
    p.add_argument("--en", required=True, help="English explanation (never replaces original)")
    p.add_argument("--hinglish", default="")
    p.add_argument("--by", default="reviewer")
    p.add_argument("--force", action="store_true")
    p.set_defaults(func=cmd_translate)

    p = sub.add_parser("translate-scan", help="list facts needing translation")
    p.add_argument("--limit", type=int, default=20)
    p.set_defaults(func=cmd_translate_scan)

    sub.add_parser("status", help="show counts").set_defaults(func=cmd_status)
    p = sub.add_parser("run-all", help="register→extract→stage→dedupe→validate→export")
    p.add_argument("--include-rejected", action="store_true")
    p.add_argument("--allow-unknown-license", action="store_true")
    p.set_defaults(func=cmd_run_all)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
