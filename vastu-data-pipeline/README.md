# Vastu Data Pipeline

Local-first extraction & dataset-generation pipeline for the Vastu Compass app.
Turns **PDFs / scanned PDFs / TXT / HTML / EPUB** (files you provide or permitted
web pages) into clean, fully-cited JSON datasets — staged in SQLite, reviewed in
a local web UI, exportable to Supabase.

**Data principles enforced by the code:**

| Principle | How it's enforced |
|---|---|
| Every fact is traceable | Every record carries `source.source_id / chapter / page / original_text` — validation *errors* if missing |
| Never invent | The classifier only structures verbatim text; AI/human explanations must be separate `interpretation` records with a mandatory `interpretation_note` |
| Never mix sources | Different sources → separate records; conflicts are marked (`conflict`/`variant`), never merged |
| Dedupe without deleting | Near-duplicates get `duplicate_of` + `similarity_score`; nothing is removed, reviewers decide |
| Original text is sacred | Hindi/Sanskrit is preserved verbatim; translations live only in `description` of companion records |
| License gate | Sources with `license_status='unknown'` are excluded from export |

---

## Project layout

```
vastu-data-pipeline/
├── sources/      ← your files (PDF/EPUB/TXT/HTML) + fetched web pages
├── raw/          ← untouched downloads
├── extracted/    ← per-source block dumps ({source_id}.jsonl)
├── cleaned/      ← per-source fact drafts + *_full.jsonl (with review/dedupe meta)
├── datasets/     ← final exports (vastu_facts.json, *.jsonl, source_registry.json …)
├── logs/         ← pipeline.log, validation_report.json, supabase_dry_run.json
├── scripts/      ← all CLI entry points
├── schemas/      ← JSON Schemas + Supabase migration SQL
├── config/       ← settings.json (thresholds, paths, ports)
├── vdp/          ← the Python package (extractors, classifier, validators …)
└── source_registry.csv  ← THE file you edit to add sources
```

## Setup

```bash
cd "C:\Users\yasha\Music\vastu app\VastuCompass\vastu-data-pipeline"
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python scripts\run_pipeline.py init
```

(Windows Git-Bash users: use `.venv/Scripts/python` the same way.)

### OCR setup (optional — only for scanned PDFs)

1. Install the Tesseract binary (UB Mannheim build is the usual Windows choice):
   https://github.com/UB-Mannheim/tesseract/wiki — note the install path.
2. Add its folder to PATH, or set it in the environment.
3. Hindi text needs the `hin` traineddata; the config defaults to `eng+hin`.
4. Verify: `tesseract --version`, then `extract` again — the `ocr_required`
   source will be processed; low-confidence pages are flagged automatically.

Without Tesseract, text PDFs/TXT/HTML/EPUB work fully; image-only sources
stay in `ocr_required` state with a clear log line.

## Add a new book/source (the complete recipe)

1. **Copy the file** into `sources/` (e.g. `sources/vastu_chintamani.pdf`).
2. **Edit `source_registry.csv`** — one row per source:

   ```csv
   source_id,title,author,language,publication_year,source_type,location,license_status,notes,extraction_status
   VASTU-CH-001,Vastu Chintamani,Author Name,hi,1990,pdf,sources/vastu_chintamani.pdf,owned,my copy,pending
   ```

   `source_type`: `pdf` (native text) · `scan_pdf` (image-only, OCR) · `txt` ·
   `html` · `epub`.
   `license_status`: `owned` (your file) · `public_domain` · `licensed` ·
   `permitted_web` · `unknown` (excluded from export).
   Set `source_type=scan_pdf` when a PDF is a photocopy/scan.
3. **Run the pipeline**:

   ```bash
   .venv/Scripts/python scripts/run_pipeline.py register   # CSV → SQLite
   .venv/Scripts/python scripts/run_pipeline.py extract    # blocks + OCR fallback
   .venv/Scripts/python scripts/run_pipeline.py stage      # classify → facts
   .venv/Scripts/python scripts/run_pipeline.py dedupe     # mark near-duplicates
   .venv/Scripts/python scripts/run_pipeline.py validate   # automated checks
   .venv/Scripts/python scripts/run_pipeline.py export     # datasets/
   ```

   or all at once: `... run_pipeline.py run-all`
4. **Review** what the classifier produced:

   ```bash
   .venv/Scripts/python scripts/review_app.py   # → http://127.0.0.1:3101
   ```

   In the UI you can approve / reject / edit fields / merge duplicates into a
   canonical record / mark conflicts / change confidence / add notes — every
   action is audit-logged and the original source text + page are always shown.
5. **Re-export** after reviewing: `... run_pipeline.py export`

### Adding a permitted web page

```bash
.venv/Scripts/python scripts/fetch_web.py https://example.org/vastu-article --title "Example" --author "Site"
```

The fetcher honors robots.txt (fail-closed), refuses login/paywall interstitials,
and never bypasses access controls. On success it registers the page as an
`html` source with `license_status=permitted_web` — then continue from step 3 above.

### Translations (Hindi/Sanskrit sources)

```bash
.venv/Scripts/python scripts/run_pipeline.py translate-scan            # what needs work
.venv/Scripts/python scripts/run_pipeline.py translate --fact-id "<id>" \
    --en "English explanation of what the source says" \
    --hinglish "optional roman-Hindi gloss" --by your-name
```

This creates a **separate** `interpretation` record that cites the same page
and keeps the original text as the claim. The original record is never modified.

## Extraction & validation commands (reference)

| Command | Purpose |
|---|---|
| `init` | create dirs + SQLite DB + registry template |
| `make-samples` | generate synthetic test documents (TXT/HTML/PDF/scan) |
| `register` | sync `source_registry.csv` → SQLite (flags unknown licenses) |
| `extract [--source-id X]` | PDF/scan/TXT/HTML/EPUB → blocks (OCR fallback) |
| `stage` | classify blocks → staged facts |
| `dedupe` | mark near-duplicates (never deletes) |
| `validate [--strict]` | all automated checks; report in `logs/validation_report.json` |
| `export [--include-rejected] [--allow-unknown-license]` | write `datasets/` |
| `translate` / `translate-scan` | add/list English explanations |
| `status` | counts by extraction/license/review status |
| `run-all` | register → extract → stage → dedupe → validate → export |

Automated validation checks: missing source, unknown source, missing page,
empty claim, missing original text, unsupported category, duplicate records,
low OCR confidence, contradictory records (same direction+room with opposite
polarity), malformed dataset JSON, interpretation records without notes.

## Dataset exports

```
datasets/
├── vastu_facts.json        ← all facts (user-documented shape)
├── vastu_facts.jsonl
├── vastu_terms.json        ← terminology subset
├── vastu_remedies.json     ← facts with remedy text
├── vastu_directions.json   ← facts tied to a direction
├── vastu_rooms.json        ← facts tied to a room
└── source_registry.json    ← full registry as exported
```

Record shape (`vastu_facts.json`):

```json
{
  "id": "SOURCE-ID::hash::seq",
  "topic": "kitchen",
  "subcategory": "room_rule",
  "claim": "…verbatim source text…",
  "description": "",
  "direction": "SE", "room": "kitchen",
  "element": "fire", "planet": "",
  "remedy": "",
  "conditions": [],
  "source": {
    "source_id": "SAMPLE-PDF-001",
    "title": "…", "author": "…",
    "chapter": "Chapter 1: Kitchen Rules", "page": "1",
    "original_text": "…exact text from that page…"
  },
  "language": "en",
  "confidence": 1.0,
  "verification_status": "unverified"
}
```

Full copies with dedupe/review bookkeeping: `cleaned/*_full.jsonl`.

## Supabase (optional)

1. Create the tables: paste `schemas/supabase_schema.sql` into the Supabase
   SQL Editor and run it (RLS enabled; optional "approved facts readable"
   policy included as a comment).
2. Copy `.env.example` → `.env`, fill `SUPABASE_URL` + `SUPABASE_KEY`.
   Use the `service_role` key **only locally**.
3. Dry-run first (no network):

   ```bash
   .venv/Scripts/python scripts/supabase_import.py            # writes logs/supabase_dry_run.json
   ```

4. Push:

   ```bash
   .venv/Scripts/python scripts/supabase_import.py --live
   ```

Tables: `sources`, `chapters`, `vastu_facts`, `directions`, `rooms`,
`remedies`, `terms`, `source_references` (1:1 with facts — every fact keeps
its page/chapter/original_text).

## Tuning

All thresholds live in `config/settings.json`:
OCR trigger (`min_chars_per_page`), OCR confidence flag
(`low_confidence_threshold`), dedupe similarity (`similarity_threshold`),
review app port, export filenames.

## App dataset round-trip

The app's dataset (`../src/data/vastuEntries.json`) is **generated** from the
pipeline — one source of truth:

```bash
.venv/Scripts/python scripts/build_app_dataset.py          # regenerate app dataset
.venv/Scripts/python scripts/build_app_dataset.py --check  # CI: exit 1 if stale
```

Edit facts in the review app or DB, then rebuild the app dataset. The importer
(`import_vastu_entries.py`) preserves the original app-entry fields
(`source_app_*` columns) so the round trip is lossless.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `⏸ needs setup — Tesseract binary not found` | Install Tesseract (see OCR setup); source stays `ocr_required` |
| `✗ file not found` in extract | `location` in the CSV must be relative to the pipeline root (or absolute) |
| Emoji/UnicodeEncodeError in console | Scripts self-configure UTF-8; run them with the venv python |
| Duplicate IDs on re-run | Re-extract + re-stage is safe: reviewer decisions are preserved (upsert keeps review/dedupe state) |
| `fact has no source_id` validation errors | You loaded facts without running `register` first, or edited the DB by hand |
| Review app port busy | change `review.port` in `config/settings.json` |

## Safety & legality

- Only extract from documents you **own**, that are **licensed** to you, are in
  the **public domain**, or from **permitted web pages** (robots-honoring).
- The pipeline never bypasses paywalls, DRM, authentication, or CAPTCHAs.
- Facts exported to the app should come from sources whose license you have
  verified; `unknown` sources are blocked from export by default.
