# North Indian Vastu Knowledge Base: Architecture (v0.1, First Task)

Status: foundation only. **No Vastu rules have been extracted.** Every source is `unverified` until an edition is provided.

## 1. Files

| File | Purpose | Status |
|---|---|---|
| 01_sources.json | Source master (12 records: 11 candidates + 1 provided file) | created |
| 02_directions.json | 8 directions + CENTER, associations empty | created |
| 03_spaces.json | 19 spaces (Pooja Room and Temple/Pooja Space kept separate) | created |
| 03b_elements.json | 7 elements (tanks, electrical, windows, doors, furniture) | created |
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
