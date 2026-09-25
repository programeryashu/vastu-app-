"""Feature 9 — automated validation checks.

Each check returns findings; none of them mutate data. Exit code of the CLI
reflects errors (warnings do not fail unless configured).
"""

from __future__ import annotations

import json
import re

from .models import CATEGORIES
from .textutils import combined_similarity

NUMERIC_CLAIM = re.compile(r"\b(\d+(?:\.\d+)?)\s*(feet|ft|meter|metre|m|inch|gaj|yard)\b", re.I)


def _src(f: dict) -> dict:
    """Accept both nested {'source': {...}} and flat staging rows."""
    s = f.get("source") or {}
    if not isinstance(s, dict):
        s = {}
    return {
        "source_id": s.get("source_id") or f.get("source_id", ""),
        "page": s.get("page") or f.get("page", ""),
        "original_text": s.get("original_text") or f.get("original_text", ""),
    }


def validate_facts(facts: list[dict], settings: dict, known_sources: set[str]) -> dict:
    errors: list[dict] = []
    warnings: list[dict] = []

    low_ocr_thr = float(settings["ocr"]["low_confidence_threshold"]) / 100.0

    for f in facts:
        fid = f.get("id", "?")
        src = _src(f)

        # missing source
        if not src["source_id"]:
            errors.append({"check": "missing_source", "id": fid,
                           "msg": "fact has no source_id"})
        elif src["source_id"] not in known_sources:
            errors.append({"check": "unknown_source", "id": fid,
                           "msg": f"source_id {src['source_id']!r} not in registry"})

        # missing page
        if not str(src["page"]).strip():
            warnings.append({"check": "missing_page", "id": fid,
                             "msg": "no page number recorded"})

        # empty claim
        if not str(f.get("claim", "")).strip():
            errors.append({"check": "empty_claim", "id": fid, "msg": "claim is empty"})
        if not str(src["original_text"]).strip():
            errors.append({"check": "missing_original_text", "id": fid,
                           "msg": "original_text empty — fact is untraceable"})

        # unsupported category
        cat = f.get("category") or f.get("topic")
        if cat and cat not in CATEGORIES:
            warnings.append({"check": "unsupported_category", "id": fid,
                             "msg": f"category {cat!r} not in canonical list"})

        # low OCR confidence
        oc = f.get("ocr_confidence")
        if oc is not None and oc < low_ocr_thr:
            warnings.append({"check": "low_ocr_confidence", "id": fid,
                             "msg": f"OCR confidence {oc:.2f} below {low_ocr_thr:.2f}"})

        # interpretation discipline (feature 13)
        if f.get("record_type") == "interpretation" and not (f.get("interpretation_note") or "").strip():
            errors.append({"check": "interpretation_unmarked", "id": fid,
                           "msg": "interpretation without interpretation_note"})

    # duplicate records among currently-active facts
    dupes = _intra_set_duplicates(facts, settings)
    for d in dupes:
        warnings.append({"check": "duplicate_record", "id": d["fact_id"],
                         "msg": f"near-duplicate of {d['duplicate_of']} (score={d['similarity_score']})"})

    # contradictory records: same direction+room, opposite polarity claims
    contradictions = _find_contradictions(facts)
    for c in contradictions:
        warnings.append({"check": "contradiction", "id": c[0],
                         "msg": f"conflicts with {c[1]}: {c[2]}"})

    return {"errors": errors, "warnings": warnings}


def _intra_set_duplicates(facts: list[dict], settings: dict) -> list[dict]:
    thr = float(settings["dedupe"]["similarity_threshold"])
    out = []
    seen: list[dict] = []
    for f in sorted(facts, key=lambda x: x["id"]):
        if len(f.get("claim", "").split()) < int(settings["dedupe"]["min_tokens"]):
            continue
        hit = None
        for c in seen:
            s = combined_similarity(f["claim"], c["claim"])
            if s >= thr:
                hit = (c["id"], round(s, 4))
                break
        if hit:
            out.append({"fact_id": f["id"], "duplicate_of": hit[0],
                        "similarity_score": hit[1]})
        else:
            seen.append(f)
    return out


_NEG = re.compile(r"\b(not|never|avoid|don't|do not|nahin|mat)\b", re.I)


def _find_contradictions(facts: list[dict]) -> list[tuple[str, str, str]]:
    """Same (direction, room), one affirmative + one negative claim."""
    groups: dict[tuple, list[dict]] = {}
    for f in facts:
        key = (f.get("direction", ""), f.get("room", ""))
        if key != ("", ""):
            groups.setdefault(key, []).append(f)
    out = []
    for key, members in groups.items():
        for i in range(len(members)):
            for j in range(i + 1, len(members)):
                a, b = members[i], members[j]
                if combined_similarity(a["claim"], b["claim"]) > 0.9:
                    continue  # near-identical, not a contradiction
                na, nb = bool(_NEG.search(a["claim"])), bool(_NEG.search(b["claim"]))
                if na != nb:
                    out.append((a["id"], b["id"],
                                f"polarity differs in {key[0] or '-'}/{key[1] or '-'}"))
    return out


def validate_json_file(path) -> list[str]:
    """Malformed JSON check for any exported dataset file."""
    errs = []
    try:
        with open(path, "r", encoding="utf-8") as f:
            json.load(f)
    except Exception as e:  # noqa: BLE001
        errs.append(f"{path}: {e}")
    return errs


def summarize(results: dict) -> str:
    e, w = len(results["errors"]), len(results["warnings"])
    return f"validation: {e} error(s), {w} warning(s)"
