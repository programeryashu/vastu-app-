"""Staging — turn classified blocks into StagedFact rows with full citations."""

from __future__ import annotations

from .models import SourceRef, StagedFact
from .textutils import short_hash


def block_to_fact(block: dict, classification: dict, source: dict) -> StagedFact:
    """Create one staged fact from a block + its classification + source row.

    The claim IS the source text (record_type=source_fact). Interpretations are
    never fabricated here — reviewers/AI add them explicitly later with
    record_type=interpretation.
    """
    page = block.get("page_number")
    orig = block.get("text", "")
    fid = f"{source['source_id']}::{short_hash(orig + '::' + str(block.get('seq', '')))}::{block.get('seq', 0):05d}"

    src_ref = SourceRef(
        source_id=source["source_id"],
        title=source.get("title", ""),
        author=source.get("author", ""),
        chapter=block.get("chapter", "") or "",
        page=str(page) if page is not None else "",
        original_text=orig,
    )

    return StagedFact(
        id=fid,
        topic=classification.get("topic", ""),
        subcategory=classification.get("subcategory", ""),
        category=classification.get("category", ""),
        claim=orig,
        description=classification.get("description", ""),
        direction=classification.get("direction", ""),
        room=classification.get("room", ""),
        element=classification.get("element", ""),
        planet=classification.get("planet", ""),
        remedy=classification.get("remedy", ""),
        conditions=classification.get("conditions", []),
        source=src_ref,
        language=classification.get("language", source.get("language", "en")),
        confidence=1.0 if block.get("extraction_method") != "ocr" else (
            (block.get("ocr_confidence") or 0.0) / 100.0
        ),
        verification_status="unverified",
        chunk_id=block.get("chunk_id", ""),
        ocr_confidence=block.get("ocr_confidence"),
    )


def stage_blocks(blocks: list[dict], source: dict) -> list[StagedFact]:
    from .classify import classify_block

    facts = []
    for b in blocks:
        if b.get("block_type") == "page_marker":
            continue  # markers are traceability aids, not knowledge
        c = classify_block(b)
        facts.append(block_to_fact(b, c, source))
    return facts
