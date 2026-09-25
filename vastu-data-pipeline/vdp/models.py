"""Pydantic models: source registry, extracted blocks, staged facts, review actions.

Data principle (enforced structurally):
  SOURCE FACT      -> record_type = "source_fact"   (verbatim structure of the source text)
  INTERPRETATION   -> record_type = "interpretation" (must set interpretation_note; never
                      presented as the source's own words; source still cited)
  APPLICATION RULE -> record_type = "app_rule"       (how the app intends to use it)
"""

from __future__ import annotations

import re
import unicodedata
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

RecordType = Literal["source_fact", "interpretation", "app_rule"]
VerificationStatus = Literal[
    "unverified", "approved", "rejected", "conflict", "variant", "duplicate"
]

# Canonical categories (feature 4). "पूजा room" kept under its English key;
# the Devanagari alias maps to it in the classifier.
CATEGORIES: tuple[str, ...] = (
    "direction", "room", "entrance", "kitchen", "bedroom", "bathroom",
    "puja_room", "staircase", "window", "door", "plot", "land", "colors",
    "elements", "planets", "zones", "measurements", "remedies", "principles",
    "terminology", "exceptions", "source_reference", "defects", "mantras",
)

CATEGORY_ALIASES: dict[str, str] = {
    "पूजा room": "puja_room",
    "पूजा": "puja_room",
    "puja room": "puja_room",
    "prayer room": "puja_room",
}

DIRECTIONS = ("N", "NE", "E", "SE", "S", "SW", "W", "NW", "center")


def normalize_category(raw: str) -> str:
    """Map a raw category string (incl. Hindi aliases) to a canonical key."""
    raw = (raw or "").strip().lower()
    if raw in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[raw]
    return re.sub(r"[\s\-]+", "_", raw)


class SourceRecord(BaseModel):
    """Feature 1 — source registry entry."""

    model_config = ConfigDict(extra="forbid")

    source_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    author: str = ""
    language: str = "en"
    publication_year: Optional[int] = None
    source_type: Literal["pdf", "scan_pdf", "txt", "html", "epub", "web", "other"] = "other"
    location: str = ""  # URL or local file path
    license_status: Literal[
        "public_domain", "licensed", "owned", "permitted_web", "unknown"
    ] = "unknown"
    notes: str = ""
    extraction_status: Literal[
        "pending", "extracted", "ocr_required", "failed", "superseded"
    ] = "pending"


class Block(BaseModel):
    """One extracted structural unit from a document (feature 2)."""

    model_config = ConfigDict(extra="forbid")

    source_id: str
    chunk_id: str
    seq: int
    page_number: Optional[int] = None
    chapter: str = ""
    heading: str = ""
    block_type: Literal["chapter", "heading", "paragraph", "list", "table", "page_marker"] = "paragraph"
    text: str
    list_items: list[str] = Field(default_factory=list)
    table_rows: list[list[str]] = Field(default_factory=list)
    extraction_method: Literal["text", "ocr", "html", "epub", "plain"] = "text"
    ocr_confidence: Optional[float] = None

    @field_validator("text")
    @classmethod
    def _clean_text(cls, v: str) -> str:
        return unicodedata.normalize("NFC", v).strip()


class StagedFact(BaseModel):
    """Feature 5 — structured knowledge record (schema-compliant superset).

    The JSON export uses exactly the user's documented field order/shape;
    extra bookkeeping fields (record_type, dedupe, review) live in SQLite
    and in the *_full.json cleaned files.
    """

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    record_type: RecordType = "source_fact"
    interpretation_note: Optional[str] = None
    topic: str = ""
    subcategory: str = ""
    category: str = ""  # canonical category (bookkeeping; not in public export shape)
    claim: str = Field(min_length=1)
    description: str = ""
    direction: str = ""
    room: str = ""
    element: str = ""
    planet: str = ""
    remedy: str = ""
    conditions: list[str] = Field(default_factory=list)
    source: "SourceRef"
    language: str = "en"
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    verification_status: VerificationStatus = "unverified"
    # dedupe (feature 7)
    canonical_record_id: Optional[str] = None
    duplicate_of: Optional[str] = None
    similarity_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    # review (feature 12)
    review_notes: str = ""
    reviewed_by: str = ""
    reviewed_at: str = ""
    conflict_group: Optional[str] = None
    variant_group: Optional[str] = None
    # traceability
    chunk_id: str = ""
    ocr_confidence: Optional[float] = None

    @model_validator(mode="after")
    def _interpretation_rule(self):
        if self.record_type == "interpretation" and not (self.interpretation_note or "").strip():
            raise ValueError(
                "interpretation records must carry interpretation_note "
                "(never present generated text as the source's own words)"
            )
        if self.record_type == "source_fact" and self.interpretation_note:
            raise ValueError("source_fact records must not carry interpretation_note")
        return self


class SourceRef(BaseModel):
    """Citation embedded in every fact — never optional, never merged."""

    model_config = ConfigDict(extra="forbid")

    source_id: str = Field(min_length=1)
    title: str = ""
    author: str = ""
    chapter: str = ""
    page: str = ""
    original_text: str = Field(min_length=1)


class ReviewAction(BaseModel):
    """Feature 12 — one audit-trail row of what the reviewer did."""

    model_config = ConfigDict(extra="forbid")

    fact_id: str
    action: Literal[
        "approve", "reject", "edit", "merge", "mark_conflict", "mark_variant",
        "note", "confidence",
    ]
    field: Optional[str] = None
    old_value: str = ""
    new_value: str = ""
    performed_by: str = "admin"
    performed_at: str = ""
