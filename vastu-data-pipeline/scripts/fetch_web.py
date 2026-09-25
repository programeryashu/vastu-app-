#!/usr/bin/env python3
"""Fetch a PERMITTED web page and register it as an HTML source.

Usage:
    python scripts/fetch_web.py https://example.org/vastu-notes --title "Example Notes" --author "Site"

Refuses: robots-disallowed URLs, login/paywall interstitials, auth-gated content.
Never bypasses access controls. On success, adds a registry row
(license_status='permitted_web') ready for `extract`.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from vdp import registry, webfetch  # noqa: E402
from vdp.paths import load_settings  # noqa: E402
from vdp.textutils import short_hash  # noqa: E402
from vdp.models import SourceRecord  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--title", required=True)
    ap.add_argument("--author", default="")
    ap.add_argument("--language", default="en")
    ap.add_argument("--year", type=int, default=None)
    args = ap.parse_args()

    settings = load_settings()
    sources_dir = ROOT / settings["paths"]["sources"]
    try:
        meta = webfetch.fetch_page(args.url, out_dir=sources_dir, settings=settings)
    except webfetch.FetchRefused as e:
        print(f"✗ REFUSED: {e}")
        sys.exit(2)
    except Exception as e:  # noqa: BLE001
        print(f"✗ fetch failed: {e}")
        sys.exit(1)

    sid = f"WEB-{short_hash(args.url, 8).upper()}"
    rec = SourceRecord(
        source_id=sid,
        title=args.title,
        author=args.author,
        language=args.language,
        publication_year=args.year,
        source_type="html",
        location=str(Path(meta["saved_to"]).relative_to(ROOT)),
        license_status="permitted_web",
        notes=f"fetched {meta['fetched_at']} from {meta['url']}",
    )

    # append/merge into registry CSV, then sync
    csv_path = registry.registry_path(ROOT)
    rows = registry.load_csv(ROOT) if csv_path.exists() else []
    rows = [r for r in rows if r.source_id != sid] + [rec]
    fields = list(SourceRecord.model_fields.keys())
    import csv as _csv
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = _csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow({k: ("" if v is None else v) for k, v in r.model_dump().items()})

    print(f"✓ saved {meta['saved_to']}")
    print(f"✓ registry row added: {sid} (license_status=permitted_web)")
    print("next: python scripts/run_pipeline.py register && ... extract")


if __name__ == "__main__":
    main()
