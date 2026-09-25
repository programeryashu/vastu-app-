"""Feature 3 — OCR fallback for scanned PDFs via Tesseract (pytesseract + PyMuPDF rasters).

Detection is always available; execution requires the Tesseract binary.
Low-confidence pages are flagged (ocr_confidence below threshold) for review.
"""

from __future__ import annotations

import shutil

from .paths import load_settings

_tesseract_available: bool | None = None


def tesseract_available() -> bool:
    global _tesseract_available
    if _tesseract_available is None:
        _tesseract_available = shutil.which("tesseract") is not None
    return _tesseract_available


def page_needs_ocr(page_text: str, settings: dict | None = None) -> bool:
    """Insufficient-text heuristic: too few characters means it's probably a scan."""
    s = settings or load_settings()
    return len((page_text or "").strip()) < int(s["ocr"]["min_chars_per_page"])


def ocr_page(page, settings: dict | None = None) -> tuple[str, float]:
    """Rasterize one PyMuPDF page and OCR it. Returns (text, mean_confidence).

    Raises RuntimeError if the Tesseract binary is not installed.
    """
    import pytesseract  # local import: optional dependency

    s = settings or load_settings()
    if not tesseract_available():
        raise RuntimeError(
            "Tesseract binary not found. Install it (see README → OCR setup) "
            "or extract this source without OCR."
        )
    lang = s["ocr"]["lang"]
    pix = page.get_pixmap(dpi=int(s["ocr"]["dpi"]))
    img = _pixmap_to_pil(pix)
    data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)
    words: list[str] = []
    confs: list[float] = []
    for word, conf in zip(data["text"], data["conf"]):
        w = (word or "").strip()
        c = float(conf)
        if w and c >= 0:
            words.append(w)
            confs.append(c)
    text = " ".join(words)
    mean_conf = sum(confs) / len(confs) if confs else 0.0
    return text, round(mean_conf, 2)


def ocr_confidence_flag(conf: float, settings: dict | None = None) -> bool:
    s = settings or load_settings()
    return conf < float(s["ocr"]["low_confidence_threshold"])


def _pixmap_to_pil(pix):
    from PIL import Image
    import io

    return Image.open(io.BytesIO(pix.tobytes("png")))
