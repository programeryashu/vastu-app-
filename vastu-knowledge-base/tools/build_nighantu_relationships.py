#!/usr/bin/env python3
"""Generate 09_relationships.json links for the Rajavallabha Nighantu section.

Only relationships actually supported by the source text are emitted:
each record with vastu_relevance=explicit gets one `associated_with` edge
per referenced existing direction ID. No Vastu-rule relationships are
asserted. IDs follow the architecture convention rel_<nnnnnn> (deterministic
for a given section file order).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTION = ROOT / "11_rajavallabha_nighantu.json"
OUT = ROOT / "09_relationships.json"

EDITION_ID = "source_rajavallabha_nighantu_edition_nepali_2024"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def main() -> None:
    section = json.loads(SECTION.read_text(encoding="utf-8"))
    rels: list[dict] = []
    n = 0
    for rec in section.get("records", []):
        if rec.get("vastu_relevance") != "explicit":
            continue
        for target in rec.get("associated_directions", []):
            n += 1
            rels.append({
                "id": f"rel_{n:06d}",
                "type": "associated_with",
                "from": rec["id"],
                "to": target,
                "source_ids": [EDITION_ID],
                "note": "Direction named in the source text itself (directional winds / facing rule).",
            })
    out = {
        "dataset": "relationships",
        "version": "0.1",
        "note": (
            "Relationships mirror only what a source actually supports. Current file "
            "contains only the Rajavallabha Nighantu integration links: the 11 "
            "explicitly direction-bearing records to the direction taxonomy. These are "
            "knowledge-graph links, not extracted Vastu rules; the section records remain "
            "entry-level claims. Future batches (other sources, conflicts, supports) append here."
        ),
        "records": rels,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"relationships written: {len(rels)}")


if __name__ == "__main__":
    main()
