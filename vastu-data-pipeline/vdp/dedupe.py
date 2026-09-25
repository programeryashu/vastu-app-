"""Feature 7 — dedupe: mark near-duplicates; never delete.

Writes canonical_record_id / duplicate_of / similarity_score; the reviewer
decides what (if anything) to merge in the review app.
"""

from __future__ import annotations

from .textutils import combined_similarity


def find_duplicates(facts: list[dict], settings: dict) -> list[dict]:
    """Return list of duplicate annotations (fact_id, duplicate_of, score).

    Greedy single-pass: earlier id in sort order becomes canonical when a
    later one is similar enough. Cross-source duplicates are still marked —
    they keep separate citations (feature 6), the annotation just links them.
    """
    threshold = float(settings["dedupe"]["similarity_threshold"])
    min_tokens = int(settings["dedupe"]["min_tokens"])

    ordered = sorted(facts, key=lambda f: f["id"])
    accepted: list[dict] = []  # current canonicals
    annotations: list[dict] = []

    for f in ordered:
        text = f.get("claim", "")
        if len(text.split()) < min_tokens:
            continue  # too short to judge; never marked duplicate
        dup_of, score = None, 0.0
        for c in accepted:
            if c.get("source_id") == f.get("source_id") and c["id"] == f["id"]:
                continue
            s = combined_similarity(text, c["claim"])
            if s >= threshold and s > score:
                dup_of, score = c["id"], s
        if dup_of:
            annotations.append({
                "fact_id": f["id"], "duplicate_of": dup_of,
                "similarity_score": round(score, 4),
            })
        else:
            accepted.append(f)
    return annotations


def apply_annotations(conn, annotations: list[dict]) -> int:
    """Persist duplicate annotations into the facts table (review can undo)."""
    from . import db

    n = 0
    for a in annotations:
        cur = conn.execute(
            "SELECT verification_status, duplicate_of FROM facts WHERE id = ?",
            (a["fact_id"],),
        ).fetchone()
        if cur is None:
            continue
        # Do not clobber reviewer decisions (approved/rejected stay untouched)
        if cur["verification_status"] in ("approved", "rejected"):
            continue
        conn.execute(
            "UPDATE facts SET duplicate_of = ?, similarity_score = ?, "
            "verification_status = 'duplicate', canonical_record_id = ? WHERE id = ?",
            (a["duplicate_of"], a["similarity_score"], a["duplicate_of"], a["fact_id"]),
        )
        db.log_action(conn, a["fact_id"], action="mark_variant",
                      field="dedupe", old="",
                      new=f"dup_of={a['duplicate_of']} score={a['similarity_score']}",
                      by="pipeline")
        n += 1
    return n
