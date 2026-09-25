"""SQLite staging database (local-first; feature 1 storage + all staging tables)."""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from .paths import db_path


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


SCHEMA = """
CREATE TABLE IF NOT EXISTS sources (
  source_id        TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  author           TEXT DEFAULT '',
  language         TEXT DEFAULT 'en',
  publication_year INTEGER,
  source_type      TEXT DEFAULT 'other',
  location         TEXT DEFAULT '',
  license_status   TEXT DEFAULT 'unknown',
  notes            TEXT DEFAULT '',
  extraction_status TEXT DEFAULT 'pending',
  created_at       TEXT,
  updated_at       TEXT
);

CREATE TABLE IF NOT EXISTS blocks (
  chunk_id   TEXT PRIMARY KEY,
  source_id  TEXT NOT NULL REFERENCES sources(source_id),
  seq        INTEGER NOT NULL,
  page_number INTEGER,
  chapter    TEXT DEFAULT '',
  heading    TEXT DEFAULT '',
  block_type TEXT DEFAULT 'paragraph',
  text       TEXT NOT NULL,
  list_items TEXT DEFAULT '[]',
  table_rows TEXT DEFAULT '[]',
  extraction_method TEXT DEFAULT 'text',
  ocr_confidence REAL
);
CREATE INDEX IF NOT EXISTS idx_blocks_source ON blocks(source_id);

CREATE TABLE IF NOT EXISTS facts (
  id                 TEXT PRIMARY KEY,
  source_id          TEXT NOT NULL REFERENCES sources(source_id),
  record_type        TEXT NOT NULL DEFAULT 'source_fact',
  interpretation_note TEXT,
  topic              TEXT DEFAULT '',
  subcategory        TEXT DEFAULT '',
  category           TEXT DEFAULT '',
  claim              TEXT NOT NULL,
  description        TEXT DEFAULT '',
  direction          TEXT DEFAULT '',
  room               TEXT DEFAULT '',
  element            TEXT DEFAULT '',
  planet             TEXT DEFAULT '',
  remedy             TEXT DEFAULT '',
  conditions         TEXT DEFAULT '[]',
  chapter            TEXT DEFAULT '',
  page               TEXT DEFAULT '',
  original_text      TEXT NOT NULL,
  language           TEXT DEFAULT 'en',
  confidence         REAL DEFAULT 0.0,
  verification_status TEXT DEFAULT 'unverified',
  canonical_record_id TEXT,
  duplicate_of       TEXT,
  similarity_score   REAL,
  conflict_group     TEXT,
  variant_group      TEXT,
  review_notes       TEXT DEFAULT '',
  reviewed_by        TEXT DEFAULT '',
  reviewed_at        TEXT,
  chunk_id           TEXT DEFAULT '',
  ocr_confidence     REAL,
  source_app_category TEXT DEFAULT '',
  source_app_issue_topic TEXT DEFAULT '',
  source_app_recommendation TEXT DEFAULT '',
  source_app_mantra  TEXT DEFAULT '',
  source_app_expected_effect TEXT DEFAULT '',
  source_app_confidence TEXT DEFAULT '',
  source_app_verified TEXT DEFAULT '',
  created_at         TEXT,
  updated_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_facts_source ON facts(source_id);
CREATE INDEX IF NOT EXISTS idx_facts_status ON facts(verification_status);

CREATE TABLE IF NOT EXISTS review_log (
  log_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  fact_id      TEXT NOT NULL REFERENCES facts(id),
  action       TEXT NOT NULL,
  field        TEXT,
  old_value    TEXT DEFAULT '',
  new_value    TEXT DEFAULT '',
  performed_by TEXT DEFAULT 'admin',
  performed_at TEXT
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  stage      TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  stats_json TEXT DEFAULT '{}'
);
"""


@contextmanager
def connect(db: Path | None = None):
    p = db or db_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(p)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)
    # lightweight migration: add round-trip columns to databases created earlier
    existing = {r["name"] for r in conn.execute("PRAGMA table_info(facts)")}
    for col in ("source_app_category", "source_app_issue_topic", "source_app_recommendation",
                "source_app_mantra", "source_app_expected_effect", "source_app_confidence",
                "source_app_verified"):
        if col not in existing:
            conn.execute(f"ALTER TABLE facts ADD COLUMN {col} TEXT DEFAULT ''")


def upsert_source(conn: sqlite3.Connection, rec) -> None:
    """Insert or update a source registry row (rec: models.SourceRecord or dict)."""
    d = rec.model_dump() if hasattr(rec, "model_dump") else dict(rec)
    d["publication_year"] = d.get("publication_year")
    now = _now()
    conn.execute(
        """
        INSERT INTO sources (source_id, title, author, language, publication_year,
                             source_type, location, license_status, notes,
                             extraction_status, created_at, updated_at)
        VALUES (:source_id, :title, :author, :language, :publication_year,
                :source_type, :location, :license_status, :notes,
                :extraction_status, :created_at, :updated_at)
        ON CONFLICT(source_id) DO UPDATE SET
          title=excluded.title, author=excluded.author, language=excluded.language,
          publication_year=excluded.publication_year, source_type=excluded.source_type,
          location=excluded.location, license_status=excluded.license_status,
          notes=excluded.notes, extraction_status=excluded.extraction_status,
          updated_at=excluded.updated_at
        """,
        {**d, "created_at": now, "updated_at": now},
    )


def get_source(conn: sqlite3.Connection, source_id: str) -> sqlite3.Row | None:
    return conn.execute("SELECT * FROM sources WHERE source_id = ?", (source_id,)).fetchone()


def list_sources(conn: sqlite3.Connection) -> list[sqlite3.Row]:
    return conn.execute("SELECT * FROM sources ORDER BY source_id").fetchall()


def replace_blocks(conn: sqlite3.Connection, source_id: str, blocks: list) -> None:
    """Store extracted blocks for a source, replacing any previous extraction."""
    conn.execute("DELETE FROM blocks WHERE source_id = ?", (source_id,))
    for b in blocks:
        d = b.model_dump() if hasattr(b, "model_dump") else dict(b)
        conn.execute(
            """
            INSERT INTO blocks (chunk_id, source_id, seq, page_number, chapter, heading,
                                block_type, text, list_items, table_rows,
                                extraction_method, ocr_confidence)
            VALUES (:chunk_id, :source_id, :seq, :page_number, :chapter, :heading,
                    :block_type, :text, :list_items, :table_rows,
                    :extraction_method, :ocr_confidence)
            """,
            {
                **d,
                "list_items": json.dumps(d.get("list_items") or [], ensure_ascii=False),
                "table_rows": json.dumps(d.get("table_rows") or [], ensure_ascii=False),
            },
        )


def blocks_for_source(conn: sqlite3.Connection, source_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM blocks WHERE source_id = ? ORDER BY seq", (source_id,)
    ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["list_items"] = json.loads(d["list_items"] or "[]")
        d["table_rows"] = json.loads(d["table_rows"] or "[]")
        out.append(d)
    return out


def insert_fact(conn: sqlite3.Connection, fact) -> str:
    d = fact.model_dump() if hasattr(fact, "model_dump") else dict(fact)
    now = _now()
    src = d.pop("source", {}) or {}  # flatten citation into flat staging columns
    params = {
        **d,
        "source_id": src.get("source_id", ""),
        "chapter": src.get("chapter", "") or "",
        "page": str(src.get("page", "") or ""),
        "original_text": src.get("original_text", ""),
        "conditions": json.dumps(d.get("conditions") or [], ensure_ascii=False),
        "created_at": now,
        "updated_at": now,
    }
    conn.execute(
        """
        INSERT INTO facts (id, source_id, record_type, interpretation_note, topic,
                           subcategory, category, claim, description, direction, room,
                           element, planet, remedy, conditions, chapter, page,
                           original_text, language, confidence, verification_status,
                           canonical_record_id, duplicate_of, similarity_score,          conflict_group, variant_group, review_notes, reviewed_by,
          reviewed_at, chunk_id, ocr_confidence,
          source_app_category, source_app_issue_topic, source_app_recommendation,
          source_app_mantra, source_app_expected_effect, source_app_confidence,
          source_app_verified, created_at, updated_at)
        VALUES (:id, :source_id, :record_type, :interpretation_note, :topic,
                :subcategory, :category, :claim, :description, :direction, :room,
                :element, :planet, :remedy, :conditions, :chapter, :page,
                :original_text, :language, :confidence, :verification_status,
                :canonical_record_id, :duplicate_of, :similarity_score,
                :conflict_group, :variant_group, :review_notes, :reviewed_by,
                           :reviewed_at, :chunk_id, :ocr_confidence,
                           :source_app_category, :source_app_issue_topic,
                           :source_app_recommendation, :source_app_mantra,
                           :source_app_expected_effect, :source_app_confidence,
                           :source_app_verified, :created_at, :updated_at)
        ON CONFLICT(id) DO UPDATE SET
          topic=excluded.topic, subcategory=excluded.subcategory, category=excluded.category,
          claim=excluded.claim, description=excluded.description, direction=excluded.direction,
          room=excluded.room, element=excluded.element, planet=excluded.planet,
          remedy=excluded.remedy, conditions=excluded.conditions, chapter=excluded.chapter,
          page=excluded.page, original_text=excluded.original_text, language=excluded.language,
          confidence=excluded.confidence,
          -- review/dedupe state is reviewer-owned: never clobbered by re-staging
          canonical_record_id=facts.canonical_record_id,
          duplicate_of=facts.duplicate_of,
          similarity_score=facts.similarity_score,
          conflict_group=facts.conflict_group,
          variant_group=facts.variant_group,
          review_notes=facts.review_notes,
          reviewed_by=facts.reviewed_by,
          reviewed_at=facts.reviewed_at,
          verification_status=facts.verification_status,
          source_app_category=excluded.source_app_category,
          source_app_issue_topic=excluded.source_app_issue_topic,
          source_app_recommendation=excluded.source_app_recommendation,
          source_app_mantra=excluded.source_app_mantra,
          source_app_expected_effect=excluded.source_app_expected_effect,
          source_app_confidence=excluded.source_app_confidence,
          source_app_verified=excluded.source_app_verified,
          updated_at=excluded.updated_at
        """,
        params,
    )
    return d["id"]


def all_facts(conn: sqlite3.Connection, include_rejected: bool = True) -> list[dict]:
    rows = conn.execute("SELECT * FROM facts").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["conditions"] = json.loads(d["conditions"] or "[]")
        out.append(d)
    if include_rejected:
        return out
    return [f for f in out if f["verification_status"] != "rejected"]


def log_action(conn: sqlite3.Connection, fact_id: str, action: str,
               field: str | None = None, old: str = "", new: str = "",
               by: str = "admin") -> None:
    conn.execute(
        "INSERT INTO review_log (fact_id, action, field, old_value, new_value, performed_by, performed_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (fact_id, action, field, old, new, by, _now()),
    )
