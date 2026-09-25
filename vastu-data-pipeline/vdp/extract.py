"""Feature 2 — document extraction: PDF, scanned PDF, TXT, HTML, EPUB.

Every block keeps source_id / page_number / chapter / original_text.
Structured tables become table_rows; lists become list_items.
"""

from __future__ import annotations

import re
from pathlib import Path

from .models import Block
from .textutils import norm_ws

_HEADING_MAX = 120


def _mk_bid(source_id: str, seq: int) -> str:
    return f"{source_id}::b{seq:05d}"


def _looks_like_heading(text: str) -> bool:
    t = text.strip()
    if not t or len(t) > _HEADING_MAX:
        return False
    if t.endswith((".", "।", ",", ";")):
        return False
    words = t.split()
    if len(words) > 14:
        return False
    letters = [c for c in t if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) / len(letters) > 0.7:
        return True  # ALL-CAPS heading
    # Short line without terminal punctuation → likely heading
    return len(words) <= 10


_CHAPTER_PAT = re.compile(
    r"^\s*(chapter|चैप्टर|adhyay|अध्याय|part|section|प्रकरण)\s*[\d०-९ivxlc]*\s*[:.\-–]?\s*(.*)$",
    re.IGNORECASE,
)


def _chapter_from_heading(heading: str) -> str | None:
    m = _CHAPTER_PAT.match(heading.strip())
    if m:
        tail = (m.group(2) or "").strip()
        return norm_ws(m.group(0)) if not tail else norm_ws(tail)
    return None


class ExtractResult:
    def __init__(self, blocks: list[Block], used_ocr: bool = False):
        self.blocks = blocks
        self.used_ocr = used_ocr


def _finalize(source_id: str, blocks: list[Block]) -> list[Block]:
    out = []
    chapter = ""
    for seq, b in enumerate(blocks, start=1):
        b.seq = seq
        b.chunk_id = _mk_bid(source_id, seq)
        if b.heading:
            ch = _chapter_from_heading(b.heading)
            if ch:
                chapter = ch
        b.chapter = b.chapter or chapter
        out.append(b)
    return out


def _import_pymupdf():
    """Prefer the modern `pymupdf` name; fall back to legacy `fitz`."""
    try:
        import pymupdf
        return pymupdf
    except ImportError:
        import fitz
        return fitz


def extract_pdf(path: Path, source_id: str, settings: dict | None = None) -> ExtractResult:
    """Native text PDF extraction with per-page OCR fallback (feature 3 integration)."""
    fitz = _import_pymupdf()

    from . import ocr

    s = settings or {}
    doc = fitz.open(path)
    blocks: list[Block] = []
    used_ocr = False
    for pno, page in enumerate(doc, start=1):
        text = "\n".join(
            (b[4] or "") for b in page.get_text("blocks")
        )  # layout blocks → preserves paragraph boundaries
        conf = None
        method = "text"
        if ocr.page_needs_ocr(text, s):
            if ocr.tesseract_available():
                try:
                    text, conf = ocr.ocr_page(page, s)
                    method = "ocr"
                    used_ocr = True
                except Exception as e:  # noqa: BLE001 — keep extraction going
                    text = text or ""
                    blocks.append(Block(
                        source_id=source_id, chunk_id="", seq=0, page_number=pno,
                        block_type="page_marker",
                        text=f"[OCR FAILED on page {pno}: {e}]",
                        extraction_method="ocr", ocr_confidence=None,
                    ))
                    continue
            else:
                blocks.append(Block(
                    source_id=source_id, chunk_id="", seq=0, page_number=pno,
                    block_type="page_marker",
                    text=f"[SCAN DETECTED on page {pno} — install Tesseract to OCR this page]",
                    extraction_method="text",
                ))
                continue
        for para in _split_paragraphs(text):
            if not para:
                continue
            is_heading = _looks_like_heading(para)
            blocks.append(Block(
                source_id=source_id, chunk_id="", seq=0, page_number=pno,
                heading=para if is_heading else "",
                block_type="heading" if is_heading else "paragraph",
                text=para, extraction_method=method, ocr_confidence=conf,
            ))
    doc.close()
    return ExtractResult(_finalize(source_id, blocks), used_ocr)


def extract_scan_pdf(path: Path, source_id: str, settings: dict | None = None) -> ExtractResult:
    """Force-OCR every page of a scanned PDF."""
    fitz = _import_pymupdf()

    from . import ocr

    s = settings or {}
    doc = fitz.open(path)
    blocks: list[Block] = []
    for pno, page in enumerate(doc, start=1):
        text, conf = ocr.ocr_page(page, s)
        for para in _split_paragraphs(text):
            if not para:
                continue
            is_heading = _looks_like_heading(para)
            blocks.append(Block(
                source_id=source_id, chunk_id="", seq=0, page_number=pno,
                heading=para if is_heading else "",
                block_type="heading" if is_heading else "paragraph",
                text=para, extraction_method="ocr", ocr_confidence=conf,
            ))
    doc.close()
    return ExtractResult(_finalize(source_id, blocks), used_ocr=True)


def extract_txt(path: Path, source_id: str, settings: dict | None = None) -> ExtractResult:
    raw = path.read_text(encoding="utf-8", errors="replace")
    blocks: list[Block] = []
    page = 1
    forced_page = False
    for part in re.split(r"\n\s*[-=_*]{3,}\s*\n", raw):
        forced_page = True
        for para in _split_paragraphs(part):
            if not para:
                continue
            is_heading = _looks_like_heading(para)
            blocks.append(Block(
                source_id=source_id, chunk_id="", seq=0, page_number=page,
                heading=para if is_heading else "",
                block_type="heading" if is_heading else "paragraph",
                text=para, extraction_method="plain",
            ))
        if forced_page:
            blocks.append(Block(
                source_id=source_id, chunk_id="", seq=0, page_number=page,
                block_type="page_marker", text=f"--- page {page} ---",
                extraction_method="plain",
            ))
            page += 1
    return ExtractResult(_finalize(source_id, blocks))


def extract_html(path: Path, source_id: str, settings: dict | None = None) -> ExtractResult:
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="replace"), "html.parser")
    for tag in soup(["script", "style", "noscript", "nav", "footer", "header"]):
        tag.decompose()
    blocks: list[Block] = []
    seq_page = 1
    main = soup.body or soup
    for el in main.find_all(["h1", "h2", "h3", "h4", "p", "li", "table"]):
        if el.name in ("h1", "h2", "h3", "h4"):
            text = norm_ws(el.get_text(" "))
            if text:
                blocks.append(Block(
                    source_id=source_id, chunk_id="", seq=0, page_number=seq_page,
                    heading=text, block_type="heading", text=text,
                    extraction_method="html",
                ))
        elif el.name == "p":
            text = norm_ws(el.get_text(" "))
            if text:
                blocks.append(Block(
                    source_id=source_id, chunk_id="", seq=0, page_number=seq_page,
                    block_type="paragraph", text=text, extraction_method="html",
                ))
        elif el.name == "li":
            # attach list items to the previous block's list_items
            text = norm_ws(el.get_text(" "))
            if text:
                if blocks and blocks[-1].block_type in ("paragraph", "heading"):
                    blocks[-1].list_items.append(text)
                    blocks[-1].block_type = "list"
                else:
                    blocks.append(Block(
                        source_id=source_id, chunk_id="", seq=0, page_number=seq_page,
                        block_type="list", text=text, list_items=[text],
                        extraction_method="html",
                    ))
        elif el.name == "table":
            rows: list[list[str]] = []
            for tr in el.find_all("tr"):
                cells = [norm_ws(td.get_text(" ")) for td in tr.find_all(["td", "th"])]
                if any(cells):
                    rows.append(cells)
            if rows:
                blocks.append(Block(
                    source_id=source_id, chunk_id="", seq=0, page_number=seq_page,
                    block_type="table",
                    text=" | ".join(" ; ".join(r) for r in rows[:3]),
                    table_rows=rows, extraction_method="html",
                ))
                seq_page += 1
    return ExtractResult(_finalize(source_id, blocks))


def extract_epub(path: Path, source_id: str, settings: dict | None = None) -> ExtractResult:
    """EPUB via zipfile + BeautifulSoup (both stdlib-adjacent; no ebooklib needed)."""
    import zipfile
    from bs4 import BeautifulSoup

    blocks: list[Block] = []
    page = 1
    with zipfile.ZipFile(path) as zf:
        html_files = sorted(
            n for n in zf.namelist()
            if n.lower().endswith((".xhtml", ".html", ".htm"))
        )
        for name in html_files:
            soup = BeautifulSoup(zf.read(name), "html.parser")
            for tag in soup(["script", "style"]):
                tag.decompose()
            title = soup.title.get_text(" ") if soup.title else ""
            for el in soup.find_all(["h1", "h2", "h3", "p"]):
                text = norm_ws(el.get_text(" "))
                if not text:
                    continue
                if el.name in ("h1", "h2", "h3"):
                    blocks.append(Block(
                        source_id=source_id, chunk_id="", seq=0, page_number=page,
                        chapter=norm_ws(title), heading=text, block_type="heading",
                        text=text, extraction_method="epub",
                    ))
                else:
                    blocks.append(Block(
                        source_id=source_id, chunk_id="", seq=0, page_number=page,
                        chapter=norm_ws(title), block_type="paragraph", text=text,
                        extraction_method="epub",
                    ))
            page += 1
    return ExtractResult(_finalize(source_id, blocks))


def _split_paragraphs(text: str) -> list[str]:
    """Paragraph split on blank lines; merge hard-wrapped lines within a paragraph."""
    paras = []
    for chunk in re.split(r"\n\s*\n", text or ""):
        merged = norm_ws(" ".join(line.strip() for line in chunk.splitlines()))
        if merged:
            paras.append(merged)
    return paras


EXTRACTORS = {
    "pdf": extract_pdf,
    "scan_pdf": extract_scan_pdf,
    "txt": extract_txt,
    "html": extract_html,
    "epub": extract_epub,
}


def extract_any(path: Path, source_type: str, source_id: str,
                settings: dict | None = None) -> ExtractResult:
    fn = EXTRACTORS.get(source_type)
    if fn is None:
        raise ValueError(f"Unsupported source_type: {source_type!r}")
    return fn(path, source_id, settings)
