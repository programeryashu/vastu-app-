# North Indian Vastu Knowledge Base: Architecture (v0.1, First Task)

Status: foundation only. **No Vastu rules have been extracted.** Every source is `unverified` until an edition is provided.

## 1. Files

| File | Purpose | Status |
|---|---|---|
| 01_sources.json | Source master (12 records: 11 candidates + 1 provided file) | created |
| 02_directions.json | 8 directions + CENTER, associations empty | created |
| 03_spaces.json | 19 spaces (Pooja Room and Temple/Pooja Space kept separate) | created |
| 03b_elements.json | 7 elements (tanks, electrical, windows, doors, furniture) | created |
| 11_rajavallabha_nighantu.json | Source-specific section: Rajavallabha Nighantu — 936 records extracted from the Sapkota (VS 2080) edition | created |
| 09_relationships.json | Knowledge-graph links (currently: the Nighantu explicit direction records → direction taxonomy) | created |
| tools/ | split_nighantu_pages.py, parse_nighantu_verses.py, build_nighantu_records.py, build_nighantu_relationships.py, validate_dataset.py | created |
| 04 to 10, README.md | rules, room×direction, remedies, doshas, conflicts, relationships, tags | later batches |

## 2. Taxonomy (top-level categories)

1. direction / sub-direction
2. vastu_purusha_mandala
3. site (plot selection, shape, land characteristics)
4. entrance
5. space (rooms)
6. element (water tank, underground tank, septic tank, electrical equipment, windows, doors, furniture)
7. orientation (sleeping, cooking, study)
8. dosha
9. remedy
10. commercial (separate branch, added after residential)

Decided: tanks, electrical equipment, windows, doors and furniture are *elements*, kept in 03b_elements.json (IDs `element_<name>`), not in the room list.

## 3. Stable ID convention

IDs encode meaning, never row numbers.

- `direction_NE`, `space_kitchen`, `source_vastu_raja_vallabha`
- `rule_<space>_<direction>_<nnn>` e.g. `rule_kitchen_SE_001`
- `remedy_<space>_<direction>_<nnn>`, `dosha_<direction>_<nnn>`
- `rd_<space>_<direction>_<nnn>` for room×direction records
- `conflict_<nnnnn>`, `rel_<nnnnnn>`

Rules: lowercase snake_case, direction codes uppercase, numeric suffix only to separate otherwise identical keys, IDs never reused after deletion.

Decided: readable IDs (`rule_kitchen_SE_001`), not `vastu_rule_000001`. The `id` field in the master schema uses the readable form.

## 4. Evidence levels

| Level | Meaning | Gate |
|---|---|---|
| A | Directly supported by a primary text | Source edition provided and location checked |
| B | Multiple reliable traditional sources agree | At least 2 independent sources, both located |
| C | One secondary source | Book and author identifiable |
| D | Modern or popular interpretation | Never promoted to A or B |
| U | Insufficient evidence | Default; compatibility = unknown |

A claim cannot be rated A just because it sounds traditional.

## 5. Source verification states

`source_location_status`: not_verified (default) → partially_verified (book known, page or verse unchecked) → verified (page or verse checked against the provided document).

## 6. Conflict handling

- Same topic, different claims → separate records sharing a `conflict_group_id`, each with `position` (A, B, ...), its own claim and its own source_ids, and `agreement_status: conflicting`.
- No record is declared correct. `conflict_summary` describes the disagreement only.
- Conflicts are mirrored in 09_relationships.json using `contradicts` / `alternative_rule`.

## 7. Research workflow

Nine phases per the brief: source inventory → text extraction → normalization → rule extraction (one rule = one record) → source linking → conflict detection → duplicate detection → quality control → export. Each batch ends with schema validation, source check, duplicate-ID check, regional-scope check and a list of unresolved questions.

## 8. Known constraints

- The only provided document is Ayurvedic and not usable for Vastu extraction (see 01_sources.json).
- Scanned Devanagari books have no text layer. Extraction means reading page images; OCR here supports English only. Every page and verse reference must come from a page actually viewed.
- Regional classification (North India vs other traditions) of each classical text is unassessed. It needs scholarly confirmation and should be recorded per rule in `regional_notes`.

## 9. Decisions log

- Pooja Room and Temple/Pooja Space: kept as two separate spaces.
- Elements: separate master list (03b_elements.json).
- IDs: readable format.
- Sources: user will supply Vastu texts as PDFs; none received yet (only the Ayurvedic Nighantu, not usable).
- 2026-10-02: Rajavallabha Nighantu integrated as a DISTINCT source, id `source_rajavallabha_nighantu`. NOT merged with `source_vastu_raja_vallabha` (Vastu Raja Vallabha — a different work) and not merged with the legacy reviewed record `source_rajavallabha_nighantu_1912` (same physical 1912 Khemraj edition; that record is retained unchanged for provenance).
- 2026-10-02: source-specific knowledge sections introduced (see §10); first section: `11_rajavallabha_nighantu.json`. Its records carry `entry_type` + `vastu_relevance` (none/potential/explicit) and are never auto-promoted to Vastu rules.
- 2026-10-02: the extracted Nighantu records were NOT included in the delivery that requested integration; the section ships with schema + vocabularies only and records are appended when the extraction arrives. Nothing invented in the meantime.
- 2026-10-02 (same day): extraction performed directly from a located edition — the Sapkota Nepali-bhavanuvada digital edition (VS 2080, archive.org 'rajvallabha-nigantu'), registered as `source_rajavallabha_nighantu_edition_nepali_2024` (child of the work-level `source_rajavallabha_nighantu` via `edition_of`). 936 records extracted from the verse-marked pages (1-184); IDs carry printed page + the edition's own verse numbers (numbering restarts per parichchheda). 11 records are vastu_relevance=explicit (directional winds v27-36, facing rule v13); 27 potential; the rest none. Records cite the edition ID; the work-level record stays edition-neutral. The dead archive.org identifier in `source_rajavallabha_nighantu_1912` (o30095025) is left as recorded — its replacement URL is not verified, so nothing was overwritten. Pending: visual proofread against page images; appendix pages 185+ (no verse markers).

## 10. Source-specific knowledge sections

Some sources are not Vastu texts (e.g. the Ayurvedic materia medica Rajavallabha Nighantu) but may contain plants, substances, materials or terminology that are useful context for Vastu interpretation. Such sources get a dedicated numbered file (`11_rajavallabha_nighantu.json`) instead of being forced into the rule files.

Layer hierarchy preserved per record (never collapsed):

```
RAW SOURCE (original_text / transliteration)
  → NORMALIZED ENTRY (description, name fields)
    → SOURCE CLAIM (claim_type: direct_source_claim)
      → VASTU CROSS-LINK (vastu_relevance + associated_directions/spaces/objects)
        → RELATIONSHIP (09_relationships.json, only where supported)
```

Rules for these sections:

- Every record keeps `source_id` and a `source_reference`; if the extraction gives no reliable location: `source_reference_status: "not_available"`. Page numbers/verses are never fabricated.
- `vastu_relevance: "potential"` marks entries that could matter for Vastu without the source saying so; only explicit in-source statements get `"explicit"`.
- Cross-links must reference existing taxonomy IDs (`direction_*`, `space_*`); new IDs (`plant_*`, `material_*`, `concept_*`) only when the concept is genuinely absent, following the §3 convention.
- Traditional claims are never rewritten as scientific facts; evidence gates (§4) apply unchanged — an entry is evidence level A only when its location has been checked against the edition.
- Conflicts with other sources use the §6 conflict system (separate claims, shared `conflict_group_id`); nothing is overwritten.
- A record is `nighantu_<normalized_term>` (`__nn` suffix only to separate distinct claims about the same entity); spelling variants become aliases, not duplicate records.

Current limitation: extraction was performed from the OCR text layer of the Sapkota edition without visual proofreading — OCR misreads (e.g. '5' for 'ऽ', split conjuncts) are expected inside `original_text`; every record is flagged `pending visual proofread` in `notes`, and evidence remains level A **only** in the sense that page+verse location is recorded; proofreading may still correct the text. Appendix pages 185+ (no verse markers) are a later batch.
