"""Feature 8 — translation policy.

RULE: the original text is never replaced. Original (Hindi/Sanskrit) stays in
`claim` / `source.original_text`. Any translation lives ONLY in
`description` with `record_type='interpretation'` semantics and a note.
This module creates translation records as separate interpretation rows.
"""

from __future__ import annotations

from .models import StagedFact, SourceRef
from .textutils import contains_hindi


def needs_translation(fact: StagedFact) -> bool:
    return contains_hindi(fact.claim) or fact.language in ("hi", "sa")


def make_translation_record(fact: StagedFact, english: str,
                            hinglish: str = "",
                            authored_by: str = "reviewer") -> StagedFact:
    """Build a companion INTERPRETATION record from a Hindi/Sanskrit fact.

    - original fact is untouched
    - new record cites the same source page/chapter/original_text
    - description carries the explanation; interpretation_note marks authorship
    """
    if not english.strip():
        raise ValueError("english explanation must not be empty")
    note = f"{authored_by}-written English explanation of the {fact.language} source text; not part of the source"
    desc = english.strip()
    if hinglish.strip():
        desc += f" [Hinglish: {hinglish.strip()}]"
    new_id = f"{fact.id}::interp-en"
    return StagedFact(
        id=new_id,
        record_type="interpretation",
        interpretation_note=note,
        topic=fact.topic,
        subcategory=fact.subcategory,
        claim=fact.claim,  # quoted source line; explanation lives in description
        description=desc,
        direction=fact.direction,
        room=fact.room,
        element=fact.element,
        planet=fact.planet,
        remedy=fact.remedy,
        conditions=list(fact.conditions),
        source=fact.source.model_copy(deep=True),
        language=fact.language,
        confidence=fact.confidence,
        verification_status="unverified",
        chunk_id=fact.chunk_id,
        ocr_confidence=fact.ocr_confidence,
    )


def scan_needing_translation(facts: list[StagedFact]) -> list[StagedFact]:
    return [f for f in facts if needs_translation(f)]
