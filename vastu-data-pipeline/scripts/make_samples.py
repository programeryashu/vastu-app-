#!/usr/bin/env python3
"""Generate sample local documents (TXT / HTML / PDF / scan-like PDF) + registry rows.

Everything is synthetic public-domain-style content written by this script —
safe to commit, safe to test the whole pipeline on.
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from vdp.models import SourceRecord  # noqa: E402
from vdp import registry as reg  # noqa: E402

SAMPLES_DIR = ROOT / "sources"

TXT_NAME = "sample_vastu_notes.txt"
HTML_NAME = "sample_vastu_page.html"
PDF_NAME = "sample_vastu_book.pdf"
SCAN_NAME = "sample_vastu_scan.pdf"

TXT_CONTENT = """Sample Vastu Notes (Synthetic — Owned License)
===============================================

Chapter 1: Directions
---

The kitchen should be in the south-east direction because agni, the fire
element, governs the south-east corner of the house.

The north-east corner is dedicated to water and space elements. A puja room
in the north-east is considered auspicious.

Avoid building a bathroom in the north-east corner of the plot.

Chapter 2: Rooms
---

The master bedroom is best placed in the south-west direction of the house.
Sleeping with the head towards south is described as good for health.

Stairs should rise clockwise and ideally occupy the south, west or south-west
part of the building.

Chapter 3: Plot and Measurements
---

A square or rectangular plot is considered stable. A plot extending towards
north-east brings growth, according to this text.

The main entrance in the north direction is described as bringing prosperity.

--- page 2 ---

Colors: light yellow and cream colors are recommended for the puja room,
while red colors are associated with the south-east fire zone.

Venus is associated with the bedroom and Jupiter with the puja room in this
text's planet mapping.

Chapter 4: Overlapping Rule (dedupe demo)
---

The kitchen should be in the south-east direction because agni, the fire
element, governs the south-east corner of the house.
"""

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Sample Vastu Web Notes</title></head>
<body>
<article>
  <h1>Sample Vastu Web Notes (Synthetic)</h1>
  <h2>Entrance</h2>
  <p>The main entrance is best in the north or east direction according to
  this sample page. A door opening clockwise is described as positive.</p>
  <ul>
    <li>Entrance should not face a staircase directly</li>
    <li>Keep the entrance well lit</li>
  </ul>
  <h2>Zones and Elements</h2>
  <p>Water element governs the north-east zone, while fire governs the
  south-east zone of the plot.</p>
  <table>
    <tr><th>Direction</th><th>Element</th><th>Planet</th></tr>
    <tr><td>North</td><td>Water</td><td>Mercury</td></tr>
    <tr><td>South-East</td><td>Fire</td><td>Venus</td></tr>
    <tr><td>South-West</td><td>Earth</td><td>Rahu</td></tr>
  </table>
  <h2>Exceptions</h2>
  <p>However, if the plot slope is towards north-east, water bodies there are
  described as acceptable even when the entrance is in the east.</p>
</article>
</body>
</html>
"""


def _write_txt() -> Path:
    p = SAMPLES_DIR / TXT_NAME
    p.write_text(TXT_CONTENT, encoding="utf-8")
    return p


def _write_html() -> Path:
    p = SAMPLES_DIR / HTML_NAME
    p.write_text(HTML_CONTENT, encoding="utf-8")
    return p


def _write_pdfs() -> tuple[Path, Path]:
    """Create a native-text PDF and a scan-like (image-only) PDF via PyMuPDF."""
    import fitz

    pdf_path = SAMPLES_DIR / PDF_NAME
    scan_path = SAMPLES_DIR / SCAN_NAME

    if not pdf_path.exists():
        doc = fitz.open()
        page = doc.new_page()  # A4 default
        y = 72
        blocks = [
            ("Chapter 1: Kitchen Rules", 14),
            ("The kitchen should be located in the south-east direction of the "
             "house. Cooking while facing east is described as ideal in this "
             "synthetic sample chapter.", 11),
            ("Chapter 2: Puja Room", 14),
            ("The puja room should be in the north-east corner. Idols should not "
             "face the south direction, according to this sample text.", 11),
            ("Chapter 3: Duplicate Check", 14),
            ("The kitchen should be located in the south-east direction of the "
             "house. Cooking while facing east is described as ideal in this "
             "synthetic sample chapter.", 11),
        ]
        for text, size in blocks:
            rect = fitz.Rect(72, y, 523, y + size * 4 + 20)
            page.insert_textbox(rect, text, fontsize=size, fontname="helv")
            y += size * 4 + 34
        doc.save(pdf_path)
        doc.close()

    if not scan_path.exists():
        # "Scanned" page: render text to an image page with NO text layer,
        # so native extraction finds nothing and OCR detection kicks in.
        doc = fitz.open()
        page = doc.new_page()
        tmp = fitz.open()
        tpage = tmp.new_page()
        tpage.insert_textbox(
            fitz.Rect(72, 72, 523, 700),
            "Scanned sample page: a staircase in the north-west is described as "
            "acceptable, while a staircase in the north-east is described as "
            "problematic in this synthetic scanned text.",
            fontsize=12, fontname="helv",
        )
        pix = tpage.get_pixmap(dpi=120)
        page.insert_image(fitz.Rect(36, 36, 559, 806), pixmap=pix)
        tmp.close()
        doc.save(scan_path)
        doc.close()

    return pdf_path, scan_path


SAMPLE_ROWS = [
    SourceRecord(
        source_id="SAMPLE-TXT-001",
        title="Sample Vastu Notes (synthetic)",
        author="Test Author",
        language="en",
        publication_year=2024,
        source_type="txt",
        location=f"sources/{TXT_NAME}",
        license_status="owned",
        notes="Generated by make_samples.py",
    ),
    SourceRecord(
        source_id="SAMPLE-HTML-001",
        title="Sample Vastu Web Notes (synthetic)",
        author="Test Author",
        language="en",
        publication_year=2024,
        source_type="html",
        location=f"sources/{HTML_NAME}",
        license_status="owned",
        notes="Generated by make_samples.py",
    ),
    SourceRecord(
        source_id="SAMPLE-PDF-001",
        title="Sample Vastu Book (synthetic text PDF)",
        author="Test Author",
        language="en",
        publication_year=2024,
        source_type="pdf",
        location=f"sources/{PDF_NAME}",
        license_status="owned",
        notes="Generated by make_samples.py",
    ),
    SourceRecord(
        source_id="SAMPLE-SCAN-001",
        title="Sample Vastu Scan (image-only PDF; OCR path)",
        author="Test Author",
        language="en",
        publication_year=2024,
        source_type="scan_pdf",
        location=f"sources/{SCAN_NAME}",
        license_status="owned",
        notes="Image-only page — exercises OCR detection/execution",
    ),
]


def main() -> None:
    SAMPLES_DIR.mkdir(exist_ok=True)
    _write_txt()
    _write_html()
    try:
        _write_pdfs()
    except Exception as e:  # noqa: BLE001 — PyMuPDF missing → PDFs skipped
        print(f"⚠ PDF sample generation skipped ({e}); TXT/HTML still created")

    # rewrite registry CSV: drop example row, keep user rows, add samples
    existing: list[SourceRecord] = []
    csv_path = reg.registry_path(ROOT)
    if csv_path.exists():
        import vdp.registry  # noqa: F401  (already imported as reg)
        for row in reg.load_csv(ROOT):
            if row.source_id.startswith("EXAMPLE-"):
                continue
            if row.source_id in {r.source_id for r in SAMPLE_ROWS}:
                continue
            existing.append(row)
    all_rows = existing + SAMPLE_ROWS
    fields = list(SourceRecord.model_fields.keys())
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in all_rows:
            w.writerow({k: ("" if v is None else v) for k, v in r.model_dump().items()})

    print(f"✓ samples written to {SAMPLES_DIR.name}/ "
          f"({TXT_NAME}, {HTML_NAME}, {PDF_NAME}, {SCAN_NAME})")
    print(f"✓ registry updated: {csv_path.name} with {len(SAMPLE_ROWS)} sample row(s)")


if __name__ == "__main__":
    main()
